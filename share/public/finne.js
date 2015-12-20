
define('text!components/finne/finne.html',[],function () { return '<div id="finne-page" data-ws-url="http://localhost:3002/finne/ws">\n    <canvas></canvas>\n    <button class="btn btn-danger" data-bind="click: clearAllGames" style="position: absolute; top: 0px; left: 0px;" type="button">Clear games</button>\n    <div id="chat">\n        <ul class="list-unstyled" id="chat-log" data-bind="foreach: chat.chatMessages">\n            <li data-bind=" css: className">\n                <span data-bind="text: message"></span>\n            </li>\n        </ul>\n<form action="finne_chat" data-bind="submit: submitChatMessage">\n    \n            <div class="form-group">\n                \n                <input class="form-control" data-bind="value: chatMessage" id="chat" name="chat" type="text">\n            </div>\n        \n</form>    </div>\n</div>\n\n\n<div id="finne-intro" class="modal" data-bind="modalVisible: function() { return !gameIsInProgress() }">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <form action="finne_intro" data-bind="submit: newGame">\n                <div class="modal-header">\n                    <h4>New game</h4>\n                </div>\n                <div class="modal-body">\n                    <div>\n                        \n            <div class="form-group">\n                <label class="control-label" for="name">Your name</label>\n                <input class="form-control" data-bind="value: possibleName" id="name" name="name" type="text">\n            </div>\n        \n                        \n            <div class="form-group">\n                <label class="control-label" for="unused">Game code</label>\n                <input class="form-control" disabled="disabled" id="unused" name="unused" type="text" value="abcde">\n            </div>\n        \n                        \n            <div class="form-group">\n                <label class="control-label" for="gamecode">Enter game code</label>\n                <input class="form-control" id="gamecode" name="gamecode" type="text" value="abcde">\n            </div>\n        \n                    </div>\n                </div>\n                <div class="modal-footer">\n                    <button class="btn btn-primary" type="submit">Start playing</button>\n                    <button class="btn btn-danger" data-bind="click: clearAllGames" type="button">Clear games</button>\n                </div>\n</form>        </div>\n    </div>\n</div>\n\n<div id="finne-card-choices" class="modal" data-bind="modalVisible: function() { return popupCardChoices().length }">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <form action="%23" data-bind="submit: popupMakeMove">\n                <div class="modal-header">\n                    <h4>Choices</h4>\n                </div>\n                <div class="modal-body">\n                    <h4>Choose cards to play</h4>\n                    <div class="btn-group-vertical" data-toggle="buttons" data-bind="foreach: popupCardChoices">\n                        <label class="btn btn-primary">\n                            <input type="checkbox" autocomplete="off" class="card-choices" name="card-choices" data-bind="value: suit" />\n                            <span data-bind="text: value"></span> of <span data-bind="text: suit">\n                        </label>\n                    </div>\n                    <h4>Choose card destination</h4>\n                    <div class="btn-group-vertical" data-toggle="buttons" data-bind="foreach: popupCardDestinations">\n                        <label class="btn btn-primary">\n                            <input type="radio" autocomplete="off" class="card-destination" name="card-destination" data-bind="value: to" />\n                            <span data-bind="text: to"></span>\n                        </label>\n                    </div>\n                </div>\n                <div class="modal-footer">\n                    <button class="btn btn-primary" type="submit">Start playing</button>\n                    <button class="btn btn-danger closer" data-dismiss="modal" type="button">Cancel move</button>\n                </div>\n</form>        </div>\n    </div>\n</div>\n';});

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
            this.endpoint = new WebSocket('ws://games.erikcarlsson.com/finne/ws');
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
            key: 'makePlay',
            value: function makePlay(params) {
                console.log('make play', params);
                this.sendCommand('make_play', params);
            }
        }, {
            key: 'checkPyramidPlay',
            value: function checkPyramidPlay(params) {
                console.log('check pyramid play', params);
                this.sendCommand('check_pyramid_play', params);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9jb21tdW5pY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsWUFBWTtBQUNWLGlCQURGLFlBQVksQ0FDVCxNQUFNLEVBQUU7OztrQ0FEWCxZQUFZOztBQUVqQixnQkFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCxnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLElBQUksU0FBUyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDdEUsZ0JBQUksQ0FBQyxjQUFjLEdBQUcsZUFBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsZ0JBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsWUFBTTtBQUN6QixzQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO0FBQzdELHNCQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3QixDQUFBO0FBQ0QsZ0JBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLFlBQU07QUFDMUIsc0JBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ2hGLHNCQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QixDQUFDO0FBQ0YsZ0JBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLFVBQUMsQ0FBQyxFQUFLO0FBQzdCLG9CQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbkMsc0JBQUssY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9CLENBQUE7U0FDSjs7cUJBcEJRLFlBQVk7O21CQXNCakIsY0FBQyxPQUFPLEVBQUU7QUFDVixvQkFBRyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDdEIsd0JBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUM1QywrQkFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztxQkFDNUM7QUFDRCwyQkFBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzQyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzVDLDJCQUFPLElBQUksQ0FBQztpQkFDZixNQUNJO0FBQ0QsMkJBQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUMsMkJBQU8sS0FBSyxDQUFDO2lCQUNoQjthQUNKOzs7bUJBQ1UscUJBQUMsT0FBTyxFQUFlO29CQUFiLE1BQU0seURBQUcsRUFBRTs7QUFDNUIsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDMUQ7OzttQkFDTyxrQkFBQyxNQUFNLEVBQUU7QUFDYixvQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDbkUsb0JBQUcsT0FBTyxFQUFFO0FBQ1Isd0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztpQkFDcEM7QUFDRCx1QkFBTyxPQUFPLENBQUM7YUFDbEI7OzttQkFDTyxrQkFBQyxNQUFNLEVBQUU7QUFDYix1QkFBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakMsb0JBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pDOzs7bUJBQ2UsMEJBQUMsTUFBTSxFQUFFO0FBQ3JCLHVCQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLG9CQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ2xEOzs7bUJBR00sbUJBQUc7OzthQUdUOzs7ZUEzRFEsWUFBWTs7Ozt5QkE4RFYsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy9maW5uZS9jb21tdW5pY2F0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuXG5leHBvcnQgY2xhc3MgQ29tbXVuaWNhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdmFyIHdzVXJsID0gJCgnI2Zpbm5lLXBhZ2UnKS5hdHRyKCdkYXRhLXdzLXVybCcpO1xuICAgICAgICB0aGlzLmNoYXQgPSBwYXJhbXMuY2hhdDtcbiAgICAgICAgdGhpcy5lbmRwb2ludCA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vZ2FtZXMuZXJpa2Nhcmxzc29uLmNvbS9maW5uZS93cycpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25PcGVuID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuaGFuZGxlSW5jb21pbmcgPSBwYXJhbXMuaGFuZGxlSW5jb21pbmcsXG4gICAgICAgIHRoaXMuZW5kcG9pbnQub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiAnQ29ubmVjdGlvbiBvcGVuZWQnIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uT3Blbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVuZHBvaW50Lm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogJ3NlcnZlcicsIHRleHQ6ICdDb25uZWN0aW9uIGNsb3NlZCcsIHN0YXR1czogJ3dhcm5pbmcnIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uT3BlbihmYWxzZSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW5kcG9pbnQub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3MvaW5jb21pbmcnLCBwYXJzZWQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbmNvbWluZyhwYXJzZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZChtZXNzYWdlKSB7XG4gICAgICAgIGlmKHRoaXMuY29ubmVjdGlvbk9wZW4oKSkge1xuICAgICAgICAgICAgaWYoIW1lc3NhZ2UucGFyYW1zLmhhc093blByb3BlcnR5KCdnYW1lX2NvZGUnKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UucGFyYW1zLmdhbWVfY29kZSA9IHRoaXMuZ2FtZUNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3Mvc2VuZGluZyBtZXNzYWdlJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLmVuZHBvaW50LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3MvZmFpbGVkIHRvIHNlbmQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZW5kQ29tbWFuZChjb21tYW5kLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKHsgY29tbWFuZDogY29tbWFuZCwgcGFyYW1zOiBwYXJhbXMgfSk7XG4gICAgfVxuICAgIGpvaW5HYW1lKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMuc2VuZCh7IGNvbW1hbmQ6ICdqb2luX2dhbWUnLCBwYXJhbXMgOiBwYXJhbXMgfSk7XG4gICAgICAgIGlmKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZUNvZGUgPSBwYXJhbXMuZ2FtZV9jb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cbiAgICBtYWtlUGxheShwYXJhbXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21ha2UgcGxheScsIHBhcmFtcyk7XG4gICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ21ha2VfcGxheScsIHBhcmFtcyk7XG4gICAgfVxuICAgIGNoZWNrUHlyYW1pZFBsYXkocGFyYW1zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjaGVjayBweXJhbWlkIHBsYXknLCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCdjaGVja19weXJhbWlkX3BsYXknLCBwYXJhbXMpO1xuICAgIH1cblxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IENvbW11bmljYXRvciB9O1xuIl19;
define('lib/misc/chat',['exports', 'knockout'], function (exports, _knockout) {
    

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvY2hhdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsbUJBQUcsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDcEQsY0FBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUMvQixnQkFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFMUMsZ0JBQUksRUFBRSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUU7QUFDbkQsMEJBQVUsQ0FBQyxZQUFZO0FBQUUsc0JBQUUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDcEY7U0FDSixDQUFDLENBQUM7O0FBRUgsZUFBTyxNQUFNLENBQUM7S0FDakIsQ0FBQzs7UUFFVyxJQUFJO0FBQ0YsaUJBREYsSUFBSSxDQUNELE1BQU0sRUFBRTtrQ0FEWCxJQUFJOztBQUdULGdCQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDcEIsb0JBQUksQ0FBQyxZQUFZLEdBQUcsZUFBRyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2FBQzVGLE1BQ0k7QUFDRCxvQkFBSSxDQUFDLFlBQVksR0FBRyxlQUFHLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUM5QztTQUNKOztxQkFUUSxJQUFJOzttQkFXVixhQUFDLE1BQU0sRUFBRTtBQUNSLG9CQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztBQUNqQyxvQkFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUNuRixvQkFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUMxQixvQkFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7QUFDbkIsNkJBQVMsRUFBRSxjQUFjLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNO0FBQy9DLDJCQUFPLEVBQUUsSUFBSSxHQUFHLE9BQU87aUJBQzFCLENBQUMsQ0FBQzthQUNOOzs7bUJBRU0sbUJBQUc7OzthQUdUOzs7ZUF4QlEsSUFBSTs7Ozt5QkEyQkYsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvY2hhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbi8vIGh0dHBzOi8vY29kZXJ3YWxsLmNvbS9wL3dlaXExcS9hdXRvLXNjcm9sbGluZy1leHRlbmRlci1mb3Ita25vY2tvdXQtanNcbmtvLmV4dGVuZGVycy5zY3JvbGxGb2xsb3cgPSBmdW5jdGlvbiAodGFyZ2V0LCBzZWxlY3Rvcikge1xuICAgIHRhcmdldC5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld3ZhbCkge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgICAgICBpZiAoZWwuc2Nyb2xsVG9wID09IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGVsLnNjcm9sbFRvcCA9IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodDsgfSwgMCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnQgY2xhc3MgQ2hhdCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG5cbiAgICAgICAgaWYocGFyYW1zLnNjcm9sbEZvbGxvdykge1xuICAgICAgICAgICAgdGhpcy5jaGF0TWVzc2FnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pLmV4dGVuZCh7IHNjcm9sbEZvbGxvdzogcGFyYW1zLnNjcm9sbEZvbGxvdyB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2hhdE1lc3NhZ2VzID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1dChwYXJhbXMpIHtcbiAgICAgICAgdmFyIGZyb20gPSBwYXJhbXMuZnJvbSB8fCAnc2VsZic7XG4gICAgICAgIHZhciBzdGF0dXMgPSBmcm9tID09PSAnc2VydmVyJyA/IHBhcmFtcy5zdGF0dXMgPyBwYXJhbXMuc3RhdHVzIDogJ2luZm8nIDogJ25vcm1hbCc7XG4gICAgICAgIHZhciBtZXNzYWdlID0gcGFyYW1zLnRleHQ7XG4gICAgICAgIHRoaXMuY2hhdE1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnY2hhdC1zdGF0dXMtJyArIGZyb20gKyAnLScgKyBzdGF0dXMsXG4gICAgICAgICAgICBtZXNzYWdlOiAnwrcgJyArIG1lc3NhZ2UsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBkaXNwb3NlKCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvcm4gZG93bi4gUHV0IGhlcmUgYW55IGxvZ2ljIG5lY2Vzc2FyeSB0byBjbGVhbiB1cCxcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgY2FuY2VsbGluZyBzZXRUaW1lb3V0cyBvciBkaXNwb3NpbmcgS25vY2tvdXQgc3Vic2NyaXB0aW9ucy9jb21wdXRlZHMuXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHZpZXdNb2RlbDogQ2hhdCB9O1xuIl19;
define('lib/misc/transform',["exports"], function (exports) {
    // http://stackoverflow.com/questions/14687318/how-to-find-new-coordinates-of-rectangle-after-rotation
    // https://github.com/simonsarris/Canvas-tutorials/blob/master/transform.js
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Transform = (function () {
        function Transform() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            _classCallCheck(this, Transform);

            this.reset();
            if (params.m) {
                this.m = params.m;
            }
        }

        _createClass(Transform, [{
            key: "reset",
            value: function reset() {
                this.m = [1, 0, 0, 1, 0, 0];
            }
        }, {
            key: "multiply",
            value: function multiply(matrix) {
                var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
                var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

                var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
                var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

                var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
                var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

                this.m[0] = m11;
                this.m[1] = m12;
                this.m[2] = m21;
                this.m[3] = m22;
                this.m[4] = dx;
                this.m[5] = dy;
            }
        }, {
            key: "invert",
            value: function invert() {
                var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
                var m0 = this.m[3] * d;
                var m1 = -this.m[1] * d;
                var m2 = -this.m[2] * d;
                var m3 = this.m[0] * d;
                var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
                var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
                this.m[0] = m0;
                this.m[1] = m1;
                this.m[2] = m2;
                this.m[3] = m3;
                this.m[4] = m4;
                this.m[5] = m5;
            }
        }, {
            key: "rotate",
            value: function rotate(rad) {
                var c = Math.cos(rad);
                var s = Math.sin(rad);
                var m11 = this.m[0] * c + this.m[2] * s;
                var m12 = this.m[1] * c + this.m[3] * s;
                var m21 = this.m[0] * -s + this.m[2] * c;
                var m22 = this.m[1] * -s + this.m[3] * c;
                this.m[0] = m11;
                this.m[1] = m12;
                this.m[2] = m21;
                this.m[3] = m22;
            }
        }, {
            key: "translate",
            value: function translate(x, y) {
                this.m[4] += this.m[0] * x + this.m[2] * y;
                this.m[5] += this.m[1] * x + this.m[3] * y;
            }
        }, {
            key: "scale",
            value: function scale(sx, sy) {
                this.m[0] *= sx;
                this.m[1] *= sx;
                this.m[2] *= sy;
                this.m[3] *= sy;
            }
        }, {
            key: "transformPoint",
            value: function transformPoint(px, py) {
                var x = px;
                var y = py;
                px = x * this.m[0] + y * this.m[2] + this.m[4];
                py = x * this.m[1] + y * this.m[3] + this.m[5];
                return { x: px, y: py };
            }
        }]);

        return Transform;
    })();

    exports.Transform = Transform;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvdHJhbnNmb3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFFYSxTQUFTO0FBQ1AsaUJBREYsU0FBUyxHQUNPO2dCQUFiLE1BQU0seURBQUcsRUFBRTs7a0NBRGQsU0FBUzs7QUFFZCxnQkFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2IsZ0JBQUcsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUNULG9CQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDckI7U0FDSjs7cUJBTlEsU0FBUzs7bUJBT2IsaUJBQUc7QUFDSixvQkFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7OzttQkFDTyxrQkFBQyxNQUFNLEVBQUU7QUFDYixvQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxvQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFNUQsb0JBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsb0JBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTVELG9CQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsb0JBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdkUsb0JBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLG9CQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoQixvQkFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDaEIsb0JBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLG9CQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNmLG9CQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNsQjs7O21CQUNLLGtCQUFHO0FBQ0wsb0JBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM1RCxvQkFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsb0JBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsb0JBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsb0JBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLG9CQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDN0Qsb0JBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUM3RCxvQkFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDZixvQkFBSSxDQUFDLENBQUMs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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0Msa0JBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLHVCQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDM0I7OztlQXRFUSxTQUFTIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvdHJhbnNmb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDY4NzMxOC9ob3ctdG8tZmluZC1uZXctY29vcmRpbmF0ZXMtb2YtcmVjdGFuZ2xlLWFmdGVyLXJvdGF0aW9uXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2ltb25zYXJyaXMvQ2FudmFzLXR1dG9yaWFscy9ibG9iL21hc3Rlci90cmFuc2Zvcm0uanNcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgaWYocGFyYW1zLm0pIHtcbiAgICAgICAgICAgIHRoaXMubSA9IHBhcmFtcy5tO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLm0gPSBbMSwwLDAsMSwwLDBdO1xuICAgIH1cbiAgICBtdWx0aXBseShtYXRyaXgpIHtcbiAgICAgICAgdmFyIG0xMSA9IHRoaXMubVswXSAqIG1hdHJpeC5tWzBdICsgdGhpcy5tWzJdICogbWF0cml4Lm1bMV07XG4gICAgICAgIHZhciBtMTIgPSB0aGlzLm1bMV0gKiBtYXRyaXgubVswXSArIHRoaXMubVszXSAqIG1hdHJpeC5tWzFdO1xuXG4gICAgICAgIHZhciBtMjEgPSB0aGlzLm1bMF0gKiBtYXRyaXgubVsyXSArIHRoaXMubVsyXSAqIG1hdHJpeC5tWzNdO1xuICAgICAgICB2YXIgbTIyID0gdGhpcy5tWzFdICogbWF0cml4Lm1bMl0gKyB0aGlzLm1bM10gKiBtYXRyaXgubVszXTtcblxuICAgICAgICB2YXIgZHggPSB0aGlzLm1bMF0gKiBtYXRyaXgubVs0XSArIHRoaXMubVsyXSAqIG1hdHJpeC5tWzVdICsgdGhpcy5tWzRdO1xuICAgICAgICB2YXIgZHkgPSB0aGlzLm1bMV0gKiBtYXRyaXgubVs0XSArIHRoaXMubVszXSAqIG1hdHJpeC5tWzVdICsgdGhpcy5tWzVdO1xuXG4gICAgICAgIHRoaXMubVswXSA9IG0xMTtcbiAgICAgICAgdGhpcy5tWzFdID0gbTEyO1xuICAgICAgICB0aGlzLm1bMl0gPSBtMjE7XG4gICAgICAgIHRoaXMubVszXSA9IG0yMjtcbiAgICAgICAgdGhpcy5tWzRdID0gZHg7XG4gICAgICAgIHRoaXMubVs1XSA9IGR5O1xuICAgIH1cbiAgICBpbnZlcnQoKSB7XG4gICAgICAgIHZhciBkID0gMSAvICh0aGlzLm1bMF0gKiB0aGlzLm1bM10gLSB0aGlzLm1bMV0gKiB0aGlzLm1bMl0pO1xuICAgICAgICB2YXIgbTAgPSB0aGlzLm1bM10gKiBkO1xuICAgICAgICB2YXIgbTEgPSAtdGhpcy5tWzFdICogZDtcbiAgICAgICAgdmFyIG0yID0gLXRoaXMubVsyXSAqIGQ7XG4gICAgICAgIHZhciBtMyA9IHRoaXMubVswXSAqIGQ7XG4gICAgICAgIHZhciBtNCA9IGQgKiAodGhpcy5tWzJdICogdGhpcy5tWzVdIC0gdGhpcy5tWzNdICogdGhpcy5tWzRdKTtcbiAgICAgICAgdmFyIG01ID0gZCAqICh0aGlzLm1bMV0gKiB0aGlzLm1bNF0gLSB0aGlzLm1bMF0gKiB0aGlzLm1bNV0pO1xuICAgICAgICB0aGlzLm1bMF0gPSBtMDtcbiAgICAgICAgdGhpcy5tWzFdID0gbTE7XG4gICAgICAgIHRoaXMubVsyXSA9IG0yO1xuICAgICAgICB0aGlzLm1bM10gPSBtMztcbiAgICAgICAgdGhpcy5tWzRdID0gbTQ7XG4gICAgICAgIHRoaXMubVs1XSA9IG01O1xuICAgIH1cbiAgICByb3RhdGUocmFkKSB7XG4gICAgICAgIHZhciBjID0gTWF0aC5jb3MocmFkKTtcbiAgICAgICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgICAgICB2YXIgbTExID0gdGhpcy5tWzBdICogYyArIHRoaXMubVsyXSAqIHM7XG4gICAgICAgIHZhciBtMTIgPSB0aGlzLm1bMV0gKiBjICsgdGhpcy5tWzNdICogcztcbiAgICAgICAgdmFyIG0yMSA9IHRoaXMubVswXSAqIC1zICsgdGhpcy5tWzJdICogYztcbiAgICAgICAgdmFyIG0yMiA9IHRoaXMubVsxXSAqIC1zICsgdGhpcy5tWzNdICogYztcbiAgICAgICAgdGhpcy5tWzBdID0gbTExO1xuICAgICAgICB0aGlzLm1bMV0gPSBtMTI7XG4gICAgICAgIHRoaXMubVsyXSA9IG0yMTtcbiAgICAgICAgdGhpcy5tWzNdID0gbTIyO1xuICAgIH1cbiAgICB0cmFuc2xhdGUoeCwgeSkge1xuICAgICAgICB0aGlzLm1bNF0gKz0gdGhpcy5tWzBdICogeCArIHRoaXMubVsyXSAqIHk7XG4gICAgICAgIHRoaXMubVs1XSArPSB0aGlzLm1bMV0gKiB4ICsgdGhpcy5tWzNdICogeTtcbiAgICB9XG4gICAgc2NhbGUoc3gsIHN5KSB7XG4gICAgICAgIHRoaXMubVswXSAqPSBzeDtcbiAgICAgICAgdGhpcy5tWzFdICo9IHN4O1xuICAgICAgICB0aGlzLm1bMl0gKj0gc3k7XG4gICAgICAgIHRoaXMubVszXSAqPSBzeTtcbiAgICB9XG4gICAgdHJhbnNmb3JtUG9pbnQocHgsIHB5KSB7XG4gICAgICAgIHZhciB4ID0gcHg7XG4gICAgICAgIHZhciB5ID0gcHk7XG4gICAgICAgIHB4ID0geCAqIHRoaXMubVswXSArIHkgKiB0aGlzLm1bMl0gKyB0aGlzLm1bNF07XG4gICAgICAgIHB5ID0geCAqIHRoaXMubVsxXSArIHkgKiB0aGlzLm1bM10gKyB0aGlzLm1bNV07XG4gICAgICAgIHJldHVybiB7IHg6IHB4LCB5OiBweSB9O1xuICAgIH1cbn1cbiJdfQ==;
define('lib/misc/scene',['exports', './transform'], function (exports, _transform) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Scene = (function () {
        function Scene(params) {
            _classCallCheck(this, Scene);

            this.canvas = params.canvas;
            this.ctx = this.canvas.getContext('2d');
            this.image = null;
            this.transformer = null;
        }

        _createClass(Scene, [{
            key: 'hasImage',
            value: function hasImage() {
                if (this.image == null) {
                    console.log('checked scene.hasImage, but was false');
                    return false;
                }
                return true;
            }
        }, {
            key: 'hasTransformer',
            value: function hasTransformer() {
                if (this.transformer == null) {
                    console.log('checked scene.hasTransformer, but was false');
                    return false;
                }
                return true;
            }
        }, {
            key: 'getTransformer',
            value: function getTransformer() {
                return this.transformer;
            }
        }, {
            key: 'withImage',
            value: function withImage(image) {
                this.ctx.save();
                this.transformer = new _transform.Transform();
                this.image = image;
                return this;
            }
        }, {
            key: 'done',
            value: function done() {
                this.image = null;
                this.transformer = null;
                this.ctx.restore();
            }
        }, {
            key: 'translateToCenter',
            value: function translateToCenter(x, y) {
                if (this.hasImage()) {
                    this.ctx.translate(x, y);
                    this.transformer.translate(x, y);
                }
                return this;
            }
        }, {
            key: 'rotateDegrees',
            value: function rotateDegrees(degrees) {
                var radians = this.deg2rad(degrees);

                this.ctx.rotate(radians);
                if (this.hasTransformer()) {
                    this.transformer.rotate(radians);
                }
                return this;
            }
        }, {
            key: 'drawImageCentered',
            value: function drawImageCentered(width, height) {
                if (this.hasImage()) {
                    this.ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
                }
                return this;
            }
        }, {
            key: 'deg2rad',
            value: function deg2rad(deg) {
                return deg * Math.PI / 180;
            }

            // adapted from  http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
            // padding is used to pull in the stroke line (and offset the shadow similarly) when one wants a shadow
            // but no stroke
        }, {
            key: 'roundRectCorners',
            value: function roundRectCorners(corners, radius) {
                var options = arguments.length <= 2 || arguments[2] === undefined ? { fill: false, strike: false, lineWidth: 0, shadow: {} } : arguments[2];

                if (typeof radius === 'undefined') {
                    radius = 0;
                }
                if (typeof radius === 'number') {
                    radius = { tl: radius, tr: radius, br: radius, bl: radius };
                } else {
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

                if (!this.objectIsEmpty(options.shadow)) {
                    if (options.shadow.color) {
                        this.ctx.shadowColor = options.shadow.color;
                    }
                    if (options.shadow.blur) {
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

                if (options.fill || options.fillColor) {
                    if (options.fillColor) {
                        this.ctx.fillStyle = options.fillColor;
                    }
                    this.ctx.fill();
                }
                if (options.strike || options.color) {
                    if (options.color) {
                        this.ctx.strokeStyle = options.color;
                    }
                    this.ctx.lineWidth = options.lineWidth;
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        }, {
            key: 'objectIsEmpty',
            value: function objectIsEmpty(obj) {
                return Object.keys(obj).length === 0;
            }
        }, {
            key: 'copyArray',
            value: function copyArray(array) {
                return JSON.parse(JSON.stringify(array));
            }
        }]);

        return Scene;
    })();

    exports.Scene = Scene;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2Mvc2NlbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7UUFFYSxLQUFLO0FBQ0gsaUJBREYsS0FBSyxDQUNGLE1BQU0sRUFBRTtrQ0FEWCxLQUFLOztBQUVWLGdCQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDNUIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGdCQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUMzQjs7cUJBTlEsS0FBSzs7bUJBT04sb0JBQUc7QUFDUCxvQkFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUNuQiwyQkFBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQ3JELDJCQUFPLEtBQUssQ0FBQztpQkFDaEI7QUFDRCx1QkFBTyxJQUFJLENBQUM7YUFDZjs7O21CQUNhLDBCQUFHO0FBQ2Isb0JBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDekIsMkJBQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztBQUMzRCwyQkFBTyxLQUFLLENBQUM7aUJBQ2hCO0FBQ0QsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7OzttQkFDYSwwQkFBRztBQUNiLHVCQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7YUFDM0I7OzttQkFDUSxtQkFBQyxLQUFLLEVBQUU7QUFDYixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoQixvQkFBSSxDQUFDLFdBQVcsR0FBRyxlQTVCbEIsU0FBUyxFQTRCd0IsQ0FBQztBQUNuQyxvQkFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7OzttQkFDRyxnQkFB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LEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUN2Qyx3QkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDckI7QUFDRCxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUV0Qjs7O21CQUVZLHVCQUFDLEdBQUcsRUFBRTtBQUNmLHVCQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQzthQUN4Qzs7O21CQUlRLG1CQUFDLEtBQUssRUFBRTtBQUNiLHVCQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzVDOzs7ZUF4SVEsS0FBSyIsImZpbGUiOiJnc3JjL2xpYi9taXNjL3NjZW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi90cmFuc2Zvcm0nO1xuXG5leHBvcnQgY2xhc3MgU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IHBhcmFtcy5jYW52YXM7XG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5pbWFnZSA9IG51bGw7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBudWxsO1xuICAgIH1cbiAgICBoYXNJbWFnZSgpIHtcbiAgICAgICAgaWYodGhpcy5pbWFnZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2tlZCBzY2VuZS5oYXNJbWFnZSwgYnV0IHdhcyBmYWxzZScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBoYXNUcmFuc2Zvcm1lcigpIHtcbiAgICAgICAgaWYodGhpcy50cmFuc2Zvcm1lciA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2tlZCBzY2VuZS5oYXNUcmFuc2Zvcm1lciwgYnV0IHdhcyBmYWxzZScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBnZXRUcmFuc2Zvcm1lcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZXI7XG4gICAgfVxuICAgIHdpdGhJbWFnZShpbWFnZSkge1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtKCk7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGRvbmUoKSB7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgICB0cmFuc2xhdGVUb0NlbnRlcih4LCB5KSB7XG4gICAgICAgIGlmKHRoaXMuaGFzSW1hZ2UoKSkge1xuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lci50cmFuc2xhdGUoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJvdGF0ZURlZ3JlZXMoZGVncmVlcykge1xuICAgICAgICB2YXIgcmFkaWFucyA9IHRoaXMuZGVnMnJhZChkZWdyZWVzKTtcblxuICAgICAgICB0aGlzLmN0eC5yb3RhdGUocmFkaWFucyk7XG4gICAgICAgIGlmKHRoaXMuaGFzVHJhbnNmb3JtZXIoKSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lci5yb3RhdGUocmFkaWFucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGRyYXdJbWFnZUNlbnRlcmVkKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYodGhpcy5oYXNJbWFnZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZSwgLXdpZHRoIC8gMiwgLWhlaWdodCAvIDIsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkZWcycmFkKGRlZykge1xuICAgICAgICByZXR1cm4gZGVnICogTWF0aC5QSSAvIDE4MDtcbiAgICB9XG5cbiAgICBcbiAgICAvLyBhZGFwdGVkIGZyb20gIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI1NTUxMi9ob3ctdG8tZHJhdy1hLXJvdW5kZWQtcmVjdGFuZ2xlLW9uLWh0bWwtY2FudmFzXG4gICAgLy8gcGFkZGluZyBpcyB1c2VkIHRvIHB1bGwgaW4gdGhlIHN0cm9rZSBsaW5lIChhbmQgb2Zmc2V0IHRoZSBzaGFkb3cgc2ltaWxhcmx5KSB3aGVuIG9uZSB3YW50cyBhIHNoYWRvd1xuICAgIC8vIGJ1dCBubyBzdHJva2VcbiAgICByb3VuZFJlY3RDb3JuZXJzKGNvcm5lcnMsIHJhZGl1cywgb3B0aW9ucyA9IHsgZmlsbDogZmFsc2UsIHN0cmlrZTogZmFsc2UsIGxpbmVXaWR0aDogMCwgc2hhZG93OiB7fSB9KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmFkaXVzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmFkaXVzID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHJhZGl1cyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJhZGl1cyA9IHt0bDogcmFkaXVzLCB0cjogcmFkaXVzLCBicjogcmFkaXVzLCBibDogcmFkaXVzfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UmFkaXVzID0geyB0bDogMCwgdHI6IDAsIGJyOiAwLCBibDogMCB9O1xuICAgICAgICAgICAgZm9yICh2YXIgc2lkZSBpbiBkZWZhdWx0UmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgcmFkaXVzW3NpZGVdID0gcmFkaXVzW3NpZGVdIHx8IGRlZmF1bHRSYWRpdXNbc2lkZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgICAgdmFyIHRvcExlZnQgPSBjb3JuZXJzWzBdO1xuICAgICAgICB2YXIgYm90dG9tTGVmdCA9IGNvcm5lcnNbMV07XG4gICAgICAgIHZhciBib3R0b21SaWdodCA9IGNvcm5lcnNbMl07XG4gICAgICAgIHZhciB0b3BSaWdodCA9IGNvcm5lcnNbM107XG5cbiAgICAgICAgaWYoIXRoaXMub2JqZWN0SXNFbXB0eShvcHRpb25zLnNoYWRvdykpIHtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuc2hhZG93LmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc2hhZG93Q29sb3IgPSBvcHRpb25zLnNoYWRvdy5jb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKG9wdGlvbnMuc2hhZG93LmJsdXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gb3B0aW9ucy5zaGFkb3cuYmx1cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRvcExlZnQueCArIHJhZGl1cy50bCwgdG9wTGVmdC55KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0b3BSaWdodC54IC0gcmFkaXVzLnRyLCB0b3BSaWdodC55KTtcbiAgICAgICAgdGhpcy5jdHgucXVhZHJhdGljQ3VydmVUbyh0b3BSaWdodC54LCB0b3BSaWdodC55LCB0b3BSaWdodC54LCB0b3BSaWdodC55ICsgcmFkaXVzLnRyKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhib3R0b21SaWdodC54LCBib3R0b21SaWdodC55IC0gcmFkaXVzLnRyKTtcbiAgICAgICAgdGhpcy5jdHgucXVhZHJhdGljQ3VydmVUbyhib3R0b21SaWdodC54LCBib3R0b21SaWdodC55LCBib3R0b21SaWdodC54IC0gcmFkaXVzLnRyLCBib3R0b21SaWdodC55KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhib3R0b21MZWZ0LnggKyByYWRpdXMudHIsIGJvdHRvbUxlZnQueSk7XG4gICAgICAgIHRoaXMuY3R4LnF1YWRyYXRpY0N1cnZlVG8oYm90dG9tTGVmdC54LCBib3R0b21MZWZ0LnksIGJvdHRvbUxlZnQueCwgYm90dG9tTGVmdC55IC0gcmFkaXVzLnRyKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0b3BMZWZ0LngsIHRvcExlZnQueSArIHJhZGl1cy50cik7XG4gICAgICAgIHRoaXMuY3R4LnF1YWRyYXRpY0N1cnZlVG8odG9wTGVmdC54LCB0b3BMZWZ0LnksIHRvcExlZnQueCArIHJhZGl1cy50ciwgdG9wTGVmdC55KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIGlmKG9wdGlvbnMuZmlsbCB8fCBvcHRpb25zLmZpbGxDb2xvcikge1xuICAgICAgICAgICAgaWYob3B0aW9ucy5maWxsQ29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBvcHRpb25zLmZpbGxDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLnN0cmlrZSB8fCBvcHRpb25zLmNvbG9yKSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBvcHRpb25zLmNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gb3B0aW9ucy5saW5lV2lkdGg7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG5cbiAgICB9XG5cbiAgICBvYmplY3RJc0VtcHR5KG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgfVxuXG5cblxuICAgIGNvcHlBcnJheShhcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhcnJheSkpO1xuICAgIH1cbn1cbiJdfQ==;
define('lib/misc/card',['exports'], function (exports) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Card = (function () {
        function Card() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            _classCallCheck(this, Card);

            if (!params.drawParams) {
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
                centerFuzzyness: params.drawParams.centerFuzzyness
            };
            this.originalDrawParams.rotation = this.randomizeRotation(this.originalDrawParams.baseRotation, this.originalDrawParams.rotationFuzzyness);
            this.originalDrawParams.centerFuzzynessSetting = this.randomizeCenter(this.originalDrawParams.centerFuzzyness);

            this.location = null;
            this.move = undefined;
            this.drawnCorners = [];
            this.wasHovering = false;
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

        // location: { x: .., y: .. }

        _createClass(Card, [{
            key: 'setLocation',
            value: function setLocation(location) {
                this.location = location;
            }
        }, {
            key: 'setMove',
            value: function setMove(params) {
                console.log('move params', params);
                this.move = {
                    steps: params.steps,
                    stepsRemaining: params.steps,
                    rotations: params.rotations,
                    toPosition: params.toPosition,
                    fromPosition: this.location !== null ? this.location : { x: -500, y: -500 }
                };
                var xDistance = this.move.toPosition.x - this.move.fromPosition.x;
                var xDistancePerStep = xDistance / this.move.steps;
                var yDistance = this.move.toPosition.y - this.move.fromPosition.y;
                var yDistancePerStep = yDistance / this.move.steps;

                this.move.xDistancePerStep = xDistancePerStep;
                this.move.yDistancePerStep = yDistancePerStep;
                console.log('move steps', params.steps, '>', this.move.steps);
                console.log('set move', this.move, '|', this.move.steps, this);
            }
        }, {
            key: 'hasMove',
            value: function hasMove() {
                if (this.move === undefined) {
                    return false;
                }
                if (!this.move.stepsRemaining) {
                    this.move = undefined;
                    return false;
                }
                return true;
            }
        }, {
            key: 'rerandomize',
            value: function rerandomize() {
                this.rerandomizeRotation();
                this.rerandomizeCenter();
            }
        }, {
            key: 'rerandomizeRotation',
            value: function rerandomizeRotation() {
                this.originalDrawParams.rotation = this.randomizeRotation(this.originalDrawParams.baseRotation, this.originalDrawParams.rotationFuzzyness);
            }
        }, {
            key: 'rerandomizeCenter',
            value: function rerandomizeCenter() {
                this.originalDrawParams.centerFuzzynessSetting = this.randomizeCenter(this.originalDrawParams.centerFuzzyness);
            }
        }, {
            key: 'randomizeRotation',
            value: function randomizeRotation() {
                var baseRotation = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
                var rotationFuzzyness = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

                var minRotation = baseRotation - rotationFuzzyness;
                var maxRotation = baseRotation + rotationFuzzyness;
                return Math.random() * (1 + maxRotation - minRotation) + minRotation;
            }
        }, {
            key: 'randomizeCenter',
            value: function randomizeCenter() {
                var centerFuzzyness = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

                return {
                    radiusAmount: centerFuzzyness * Math.sqrt(Math.random(1)) / 2,
                    angle: Math.random() * Math.sqrt(2 * Math.PI)
                };
            }
        }, {
            key: 'shortestDimension',
            value: function shortestDimension() {
                return this.image.normal.width < this.image.normal.height ? this.image.normal.width : this.image.normal.height;
            }
        }, {
            key: 'draw',
            value: function draw() {
                var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var x;
                var y;
                var resizer = params.resizer;

                if (this.hasMove()) {
                    x = Math.round(this.move.toPosition.x - this.move.xDistancePerStep * this.move.stepsRemaining);
                    y = Math.round(this.move.toPosition.y - this.move.yDistancePerStep * this.move.stepsRemaining);
                    console.log('move to', x, y);
                    this.move.stepsRemaining--;
                } else if (this.location != null) {
                    x = this.location.x;
                    y = this.location.y;
                } else {
                    x = params.x;
                    y = params.y;
                }

                if (params.centerFuzzyness) {
                    centerFuzzyness = this.randomizeCenter(params.centerFuzzyness) * this.shortestDimension();
                    var fuzzyRadius = this.shortestDimension() * centerFuzzyness / 2;
                    var radius = fuzzyRadius * Math.sqrt(Math.random(1));
                    var angle = Math.random() * Math.sqrt(2 * Math.PI);

                    x = x + radius * Math.cos(angle);
                    y = y + radius * Math.sin(angle);
                } else {
                    var radius = this.originalDrawParams.centerFuzzynessSetting.radiusAmount * this.shortestDimension();
                    var angle = this.originalDrawParams.centerFuzzynessSetting.angle;

                    x = x + radius * Math.cos(angle);
                    y = y + radius * Math.sin(angle);
                }

                var rotation;
                if (params.baseRotation || params.rotationFuzzyness) {
                    rotation = this.randomizeRotation(params.baseRotation, params.rotationFuzzyness);
                } else {
                    rotation = this.originalDrawParams.rotation;
                }

                var actualWidth = this.image.normal.width * resizer;
                var actualHeight = this.image.normal.height * resizer;
                var transformer = this.scene.withImage(resizer < 0.7 && this.image.small ? this.image.small : this.image.normal).translateToCenter(x, y).rotateDegrees(rotation).drawImageCentered(actualWidth, actualHeight).getTransformer();

                var corners = [{ x: -actualWidth / 2, y: -actualHeight / 2 }, { x: -actualWidth / 2, y: actualHeight / 2 }, { x: actualWidth / 2, y: actualHeight / 2 }, { x: actualWidth / 2, y: -actualHeight / 2 }];

                if (this.wasHovering) {
                    var radius = actualWidth * resizer * 0.55;
                    this.scene.roundRectCorners(corners, radius, { lineWidth: actualWidth / 70, color: '#f08', shadow: { blur: 10, color: '#f08' } });
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
        }, {
            key: 'isHover',
            value: function isHover(position) {
                if (this.drawnCorners.length != 4) {
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

                if ((position.x - topLeft.x) * leftDeltaX + (position.y - topLeft.y) * leftDeltaY < 0.0) {
                    return false;
                }
                if ((position.x - bottomLeft.x) * leftDeltaX + (position.y - bottomLeft.y) * leftDeltaY > 0.0) {
                    return false;
                }
                if ((position.x - topLeft.x) * topDeltaX + (position.y - topLeft.y) * topDeltaY < 0.0) {
                    return false;
                }
                if ((position.x - topRight.x) * topDeltaX + (position.y - topRight.y) * topDeltaY > 0.0) {
                    return false;
                }

                return true;
            }
        }, {
            key: 'drawOld',
            value: function drawOld(params) {

                var x = params.x; // x, y is the center
                var y = params.y;
                var size = params.size || 1; // ratio to resize to
                var centerFuzzyness = params.centerFuzzyness || 0; // ratio of width/height that the card can be placed within
                var rotation = params.rotation || 0; // degrees!
                var rotationFuzzyness = params.rotationFuzzyness || 0; // degrees

                var width = this.image.width * size;
                var height = this.image.height * size;

                if (centerFuzzyness) {
                    var fuzzyRadius = (width < height ? width : height) * centerFuzzyness / 2;
                    var radius = fuzzyRadius * Math.sqrt(Math.random(1));
                    var angle = Math.sqrt(2 * Math.PI);

                    x = x + radius * Math.cos(angle);
                    y = y + radius * Math.sin(angle);
                }

                if (rotationFuzzyness) {
                    var minRotation = rotation - rotationFuzzyness;
                    var maxRotation = rotation + rotationFuzzyness;
                    rotation = Math.random() * (1 + maxRotation - minRotation) + minRotation;
                }

                var transformer = this.scene.withImage(this.image).translateToCenter(x, y).rotateDegrees(rotation).drawImageCentered(width, height).getTransformer();
                this.scene.done();

                // the order is important, and we pull the hovering in a bit
                var paddedWidth = width * .97;
                var paddedHeight = height * .97;
                transformations = [[-paddedWidth / 2, -paddedHeight / 2], [-paddedWidth / 2, paddedHeight / 2], [paddedWidth / 2, paddedHeight / 2], [paddedWidth / 2, -paddedHeight / 2]];

                var corners = [];
                for (var i = 0; i < transformations.length; i++) {

                    var point = transformer.transformPoint(transformations[i][0], transformations[i][1]);
                    corners.push({ x: Math.round(point[0]), y: Math.round(point[1]) });
                }
                params.actual = {
                    rotation: rotation,
                    x: x,
                    y: y
                };
                return new Card({ suit: this.suit, value: this.value, corners: corners, drawParams: params, card: this });
            }
        }]);

        return Card;
    })();

    exports.Card = Card;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvY2FyZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztRQUFhLElBQUk7QUFFRixpQkFGRixJQUFJLEdBRWE7Z0JBQWQsTUFBTSx5REFBRyxFQUFHOztrQ0FGZixJQUFJOztBQUdULGdCQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtBQUNuQixzQkFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNyRjtBQUNELGdCQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDMUIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzFCLGdCQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRTFCLGdCQUFJLFlBQVksR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEYsZ0JBQUksYUFBYSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkcsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksYUFB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RUFBRSxRQUFRO0FBQ2xCLHFCQUFDLEVBQUUsQ0FBQztBQUNKLHFCQUFDLEVBQUUsQ0FBQztpQkFDUCxDQUFDO0FBQ0YsdUJBQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFFN0c7OztlQWpQUSxJQUFJIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvY2FyZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBDYXJkIHtcblxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHsgfSkge1xuICAgICAgICBpZighcGFyYW1zLmRyYXdQYXJhbXMpIHtcbiAgICAgICAgICAgIHBhcmFtcy5kcmF3UGFyYW1zID0geyBiYXNlUm90YXRpb246IDAsIHJvdGF0aW9uRnV6enluZXNzOiAwLCBjZW50ZXJGdXp6eW5lc3M6IDAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmltYWdlID0gcGFyYW1zLmltYWdlO1xuICAgICAgICB0aGlzLnN1aXQgPSBwYXJhbXMuc3VpdDtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHBhcmFtcy52YWx1ZTtcbiAgICAgICAgdGhpcy5zY2VuZSA9IHBhcmFtcy5zY2VuZTtcblxuICAgICAgICB2YXIgc3VpdFNvcnRhYmxlID0geyBjbHViczogMSwgZGlhbW9uZHM6IDIsIHNwYWRlczogMywgaGVhcnRzOiA0LCBiYWNrOiA1LCBqb2tlcjogNiB9O1xuICAgICAgICB2YXIgdmFsdWVTb3J0YWJsZSA9IHsgJzInOiAxNSwgJzEwJzogMTYsIGphY2s6IDExLCBxdWVlbjogMTIsIGtpbmc6IDEzLCBhY2U6IDE0LCBibHVlOiAxLCByZWQ6IDEgfTtcbiAgICAgICAgdGhpcy5zdWl0U29ydGFibGUgPSBzdWl0U29ydGFibGVbdGhpcy5zdWl0XSArICdfJyArICh2YWx1ZVNvcnRhYmxlW3RoaXMudmFsdWVdIHx8ICcwJyArIHRoaXMudmFsdWUpO1xuICAgICAgICB0aGlzLnZhbHVlU29ydGFibGUgPSAodmFsdWVTb3J0YWJsZVt0aGlzLnZhbHVlXSB8fCAnMCcgKyB0aGlzLnZhbHVlKSArICdfJyArIHRoaXMuc3VpdDtcblxuICAgICAgICB0aGlzLm9yaWdpbmFsRHJhd1BhcmFtcyA9IHtcbiAgICAgICAgICAgIGJhc2VSb3RhdGlvbjogcGFyYW1zLmRyYXdQYXJhbXMuYmFzZVJvdGF0aW9uLFxuICAgICAgICAgICAgcm90YXRpb25GdXp6eW5lc3M6IHBhcmFtcy5kcmF3UGFyYW1zLnJvdGF0aW9uRnV6enluZXNzLFxuICAgICAgICAgICAgY2VudGVyRnV6enluZXNzOiBwYXJhbXMuZHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3MsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcmlnaW5hbERyYXdQYXJhbXMucm90YXRpb24gPSB0aGlzLnJhbmRvbWl6ZVJvdGF0aW9uKHRoaXMub3JpZ2luYWxEcmF3UGFyYW1zLmJhc2VSb3RhdGlvbiwgdGhpcy5vcmlnaW5hbERyYXdQYXJhbXMucm90YXRpb25GdXp6eW5lc3MpO1xuICAgICAgICB0aGlzLm9yaWdpbmFsRHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3NTZXR0aW5nID0gdGhpcy5yYW5kb21pemVDZW50ZXIodGhpcy5vcmlnaW5hbERyYXdQYXJhbXMuY2VudGVyRnV6enluZXNzKTtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5tb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRyYXduQ29ybmVycyA9IFtdO1xuICAgICAgICB0aGlzLndhc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIGxvY2F0aW9uOiB7IHg6IC4uLCB5OiAuLiB9XG4gICAgc2V0TG9jYXRpb24obG9jYXRpb24pIHtcbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgIH1cbiAgICBzZXRNb3ZlKHBhcmFtcykge1xuICAgICAgICBjb25zb2xlLmxvZygnbW92ZSBwYXJhbXMnLCBwYXJhbXMpO1xuICAgICAgICB0aGlzLm1vdmUgPSB7XG4gICAgICAgICAgICBzdGVwczogcGFyYW1zLnN0ZXBzLFxuICAgICAgICAgICAgc3RlcHNSZW1haW5pbmc6IHBhcmFtcy5zdGVwcyxcbiAgICAgICAgICAgIHJvdGF0aW9uczogcGFyYW1zLnJvdGF0aW9ucyxcbiAgICAgICAgICAgIHRvUG9zaXRpb246IHBhcmFtcy50b1Bvc2l0aW9uLFxuICAgICAgICAgICAgZnJvbVBvc2l0aW9uOiB0aGlzLmxvY2F0aW9uICE9PSBudWxsID8gdGhpcy5sb2NhdGlvbiA6IHsgeDogLSA1MDAsIHk6IC01MDAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHhEaXN0YW5jZSA9IHRoaXMubW92ZS50b1Bvc2l0aW9uLnggLSB0aGlzLm1vdmUuZnJvbVBvc2l0aW9uLng7XG4gICAgICAgIGxldCB4RGlzdGFuY2VQZXJTdGVwID0geERpc3RhbmNlIC8gdGhpcy5tb3ZlLnN0ZXBzO1xuICAgICAgICBsZXQgeURpc3RhbmNlID0gdGhpcy5tb3ZlLnRvUG9zaXRpb24ueSAtIHRoaXMubW92ZS5mcm9tUG9zaXRpb24ueTtcbiAgICAgICAgbGV0IHlEaXN0YW5jZVBlclN0ZXAgPSB5RGlzdGFuY2UgLyB0aGlzLm1vdmUuc3RlcHM7XG5cbiAgICAgICAgdGhpcy5tb3ZlLnhEaXN0YW5jZVBlclN0ZXAgPSB4RGlzdGFuY2VQZXJTdGVwO1xuICAgICAgICB0aGlzLm1vdmUueURpc3RhbmNlUGVyU3RlcCA9IHlEaXN0YW5jZVBlclN0ZXA7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtb3ZlIHN0ZXBzJywgcGFyYW1zLnN0ZXBzLCAnPicsIHRoaXMubW92ZS5zdGVwcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQgbW92ZScsIHRoaXMubW92ZSwgJ3wnLCB0aGlzLm1vdmUuc3RlcHMsIHRoaXMpO1xuICAgIH1cbiAgICBoYXNNb3ZlKCkge1xuICAgICAgICBpZih0aGlzLm1vdmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKCF0aGlzLm1vdmUuc3RlcHNSZW1haW5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVyYW5kb21pemUoKSB7XG4gICAgICAgIHRoaXMucmVyYW5kb21pemVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnJlcmFuZG9taXplQ2VudGVyKCk7XG4gICAgfVxuICAgIHJlcmFuZG9taXplUm90YXRpb24oKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxEcmF3UGFyYW1zLnJvdGF0aW9uID0gdGhpcy5yYW5kb21pemVSb3RhdGlvbih0aGlzLm9yaWdpbmFsRHJhd1BhcmFtcy5iYXNlUm90YXRpb24sIHRoaXMub3JpZ2luYWxEcmF3UGFyYW1zLnJvdGF0aW9uRnV6enluZXNzKTtcbiAgICB9XG4gICAgcmVyYW5kb21pemVDZW50ZXIoKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxEcmF3UGFyYW1zLmNlbnRlckZ1enp5bmVzc1NldHRpbmcgPSB0aGlzLnJhbmRvbWl6ZUNlbnRlcih0aGlzLm9yaWdpbmFsRHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3MpO1xuICAgIH1cbiAgICByYW5kb21pemVSb3RhdGlvbihiYXNlUm90YXRpb24gPSAwLCByb3RhdGlvbkZ1enp5bmVzcyA9IDApIHtcbiAgICAgICAgdmFyIG1pblJvdGF0aW9uID0gYmFzZVJvdGF0aW9uIC0gcm90YXRpb25GdXp6eW5lc3M7XG4gICAgICAgIHZhciBtYXhSb3RhdGlvbiA9IGJhc2VSb3RhdGlvbiArIHJvdGF0aW9uRnV6enluZXNzO1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqICgxICsgbWF4Um90YXRpb24gLSBtaW5Sb3RhdGlvbikgKyBtaW5Sb3RhdGlvbjtcbiAgICB9XG4gICAgcmFuZG9taXplQ2VudGVyKGNlbnRlckZ1enp5bmVzcyA9IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhZGl1c0Ftb3VudDogY2VudGVyRnV6enluZXNzICogTWF0aC5zcXJ0KE1hdGgucmFuZG9tKDEpKSAvIDIsXG4gICAgICAgICAgICBhbmdsZTogTWF0aC5yYW5kb20oKSAqIE1hdGguc3FydCgyICogTWF0aC5QSSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIHNob3J0ZXN0RGltZW5zaW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZS5ub3JtYWwud2lkdGggPCB0aGlzLmltYWdlLm5vcm1hbC5oZWlnaHQgPyB0aGlzLmltYWdlLm5vcm1hbC53aWR0aCA6IHRoaXMuaW1hZ2Uubm9ybWFsLmhlaWdodDtcbiAgICB9XG4gICAgZHJhdyhwYXJhbXMgPSB7fSkge1xuICAgICAgICB2YXIgeDtcbiAgICAgICAgdmFyIHk7XG4gICAgICAgIHZhciByZXNpemVyID0gcGFyYW1zLnJlc2l6ZXI7XG5cbiAgICAgICAgaWYodGhpcy5oYXNNb3ZlKCkpIHtcbiAgICAgICAgICAgIHggPSBNYXRoLnJvdW5kKHRoaXMubW92ZS50b1Bvc2l0aW9uLnggLSB0aGlzLm1vdmUueERpc3RhbmNlUGVyU3RlcCAqIHRoaXMubW92ZS5zdGVwc1JlbWFpbmluZyk7XG4gICAgICAgICAgICB5ID0gTWF0aC5yb3VuZCh0aGlzLm1vdmUudG9Qb3NpdGlvbi55IC0gdGhpcy5tb3ZlLnlEaXN0YW5jZVBlclN0ZXAgKiB0aGlzLm1vdmUuc3RlcHNSZW1haW5pbmcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmUgdG8nLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMubW92ZS5zdGVwc1JlbWFpbmluZy0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5sb2NhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB4ID0gdGhpcy5sb2NhdGlvbi54O1xuICAgICAgICAgICAgeSA9IHRoaXMubG9jYXRpb24ueTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHggPSBwYXJhbXMueDtcbiAgICAgICAgICAgIHkgPSBwYXJhbXMueTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHBhcmFtcy5jZW50ZXJGdXp6eW5lc3MpIHtcbiAgICAgICAgICAgIGNlbnRlckZ1enp5bmVzcyA9IHRoaXMucmFuZG9taXplQ2VudGVyKHBhcmFtcy5jZW50ZXJGdXp6eW5lc3MpICogdGhpcy5zaG9ydGVzdERpbWVuc2lvbigpO1xuICAgICAgICAgICAgdmFyIGZ1enp5UmFkaXVzID0gdGhpcy5zaG9ydGVzdERpbWVuc2lvbigpICogY2VudGVyRnV6enluZXNzIC8gMjtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSBmdXp6eVJhZGl1cyAqIE1hdGguc3FydChNYXRoLnJhbmRvbSgxKSk7XG4gICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5zcXJ0KDIgKiBNYXRoLlBJKTtcblxuICAgICAgICAgICAgeCA9IHggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICB5ID0geSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSB0aGlzLm9yaWdpbmFsRHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3NTZXR0aW5nLnJhZGl1c0Ftb3VudCAqIHRoaXMuc2hvcnRlc3REaW1lbnNpb24oKTtcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IHRoaXMub3JpZ2luYWxEcmF3UGFyYW1zLmNlbnRlckZ1enp5bmVzc1NldHRpbmcuYW5nbGU7XG5cbiAgICAgICAgICAgIHggPSB4ICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgeSA9IHkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcm90YXRpb247XG4gICAgICAgIGlmKHBhcmFtcy5iYXNlUm90YXRpb24gfHwgcGFyYW1zLnJvdGF0aW9uRnV6enluZXNzKSB7XG4gICAgICAgICAgICByb3RhdGlvbiA9IHRoaXMucmFuZG9taXplUm90YXRpb24ocGFyYW1zLmJhc2VSb3RhdGlvbiwgcGFyYW1zLnJvdGF0aW9uRnV6enluZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvdGF0aW9uID0gdGhpcy5vcmlnaW5hbERyYXdQYXJhbXMucm90YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWN0dWFsV2lkdGggPSB0aGlzLmltYWdlLm5vcm1hbC53aWR0aCAqIHJlc2l6ZXI7XG4gICAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSB0aGlzLmltYWdlLm5vcm1hbC5oZWlnaHQgKiByZXNpemVyO1xuICAgICAgICB2YXIgdHJhbnNmb3JtZXIgPSB0aGlzLnNjZW5lLndpdGhJbWFnZShyZXNpemVyIDwgMC43ICYmIHRoaXMuaW1hZ2Uuc21hbGwgPyB0aGlzLmltYWdlLnNtYWxsIDogdGhpcy5pbWFnZS5ub3JtYWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNsYXRlVG9DZW50ZXIoeCwgeSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yb3RhdGVEZWdyZWVzKHJvdGF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRyYXdJbWFnZUNlbnRlcmVkKGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2V0VHJhbnNmb3JtZXIoKTtcblxuICAgICAgICB2YXIgY29ybmVycyA9IFsgeyB4OiAtYWN0dWFsV2lkdGggLyAyLCB5OiAtYWN0dWFsSGVpZ2h0IC8gMiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB4OiAtYWN0dWFsV2lkdGggLyAyLCB5OiAgYWN0dWFsSGVpZ2h0IC8gMiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB4OiAgYWN0dWFsV2lkdGggLyAyLCB5OiAgYWN0dWFsSGVpZ2h0IC8gMiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB4OiAgYWN0dWFsV2lkdGggLyAyLCB5OiAtYWN0dWFsSGVpZ2h0IC8gMiB9IF07XG5cbiAgICAgICAgaWYodGhpcy53YXNIb3ZlcmluZykge1xuICAgICAgICAgICAgdmFyIHJhZGl1cyA9IGFjdHVhbFdpZHRoICogcmVzaXplciAqIDAuNTU7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJvdW5kUmVjdENvcm5lcnMoY29ybmVycywgcmFkaXVzLCB7IGxpbmVXaWR0aDogYWN0dWFsV2lkdGggLyA3MCwgY29sb3I6ICcjZjA4Jywgc2hhZG93OiB7IGJsdXI6IDEwLCBjb2xvcjogJyNmMDgnIH19KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjZW5lLmRvbmUoKTtcblxuICAgICAgICAvLyB0aGUgb3JkZXIgaXMgaW1wb3J0YW50LCBhbmQgd2UgcHVsbCB0aGUgaG92ZXJpbmcgaW4gYSBiaXRcbiAgICAgICAgLy92YXIgcGFkZGVkV2lkdGggPSBhY3R1YWxXaWR0aCAqIDE7XG4gICAgICAgIC8vdmFyIHBhZGRlZEhlaWdodCA9IGFjdHVhbEhlaWdodCAqIDE7XG4gICAgICAgIC8vdHJhbnNmb3JtYXRpb25zID0gWyBbLXBhZGRlZFdpZHRoIC8gMiwgLXBhZGRlZEhlaWdodCAvIDJdLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgWy1wYWRkZWRXaWR0aCAvIDIsICBwYWRkZWRIZWlnaHQgLyAyXSxcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIFsgcGFkZGVkV2lkdGggLyAyLCAgcGFkZGVkSGVpZ2h0IC8gMl0sXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICBbIHBhZGRlZFdpZHRoIC8gMiwgLXBhZGRlZEhlaWdodCAvIDJdIF07XG5cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcm5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwb2ludCA9IHRyYW5zZm9ybWVyLnRyYW5zZm9ybVBvaW50KGNvcm5lcnNbaV0ueCwgY29ybmVyc1tpXS55KTtcbiAgICAgICAgICAgIHRoaXMuZHJhd25Db3JuZXJzW2ldID0geyB4OiBNYXRoLnJvdW5kKHBvaW50LngpLCB5OiBNYXRoLnJvdW5kKHBvaW50LnkpIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaXNIb3Zlcihwb3NpdGlvbikge1xuICAgICAgICBpZih0aGlzLmRyYXduQ29ybmVycy5sZW5ndGggIT0gNCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5kcmF3bkNvcm5lcnNbMF07XG4gICAgICAgIHZhciBib3R0b21MZWZ0ID0gdGhpcy5kcmF3bkNvcm5lcnNbMV07XG4gICAgICAgIHZhciBib3R0b21SaWdodCA9IHRoaXMuZHJhd25Db3JuZXJzWzJdO1xuICAgICAgICB2YXIgdG9wUmlnaHQgPSB0aGlzLmRyYXduQ29ybmVyc1szXTtcblxuICAgICAgICB2YXIgbGVmdERlbHRhWCA9IGJvdHRvbUxlZnQueCAtIHRvcExlZnQueDtcbiAgICAgICAgdmFyIGxlZnREZWx0YVkgPSBib3R0b21MZWZ0LnkgLSB0b3BMZWZ0Lnk7XG4gICAgICAgIHZhciB0b3BEZWx0YVggPSB0b3BSaWdodC54IC0gdG9wTGVmdC54O1xuICAgICAgICB2YXIgdG9wRGVsdGFZID0gdG9wUmlnaHQueSAtIHRvcExlZnQueTtcblxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcExlZnQueCkgICAgKiBsZWZ0RGVsdGFYICsgKHBvc2l0aW9uLnkgLSB0b3BMZWZ0LnkpICAgICogbGVmdERlbHRhWSA8IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIGJvdHRvbUxlZnQueCkgKiBsZWZ0RGVsdGFYICsgKHBvc2l0aW9uLnkgLSBib3R0b21MZWZ0LnkpICogbGVmdERlbHRhWSA+IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcExlZnQueCkgICAgKiB0b3BEZWx0YVggICsgKHBvc2l0aW9uLnkgLSB0b3BMZWZ0LnkpICAgICogdG9wRGVsdGFZICA8IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcFJpZ2h0LngpICAgKiB0b3BEZWx0YVggICsgKHBvc2l0aW9uLnkgLSB0b3BSaWdodC55KSAgICogdG9wRGVsdGFZICA+IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfVxuICAgIGRyYXdPbGQocGFyYW1zKSB7XG5cbiAgICAgICAgdmFyIHggPSBwYXJhbXMueDsgLy8geCwgeSBpcyB0aGUgY2VudGVyXG4gICAgICAgIHZhciB5ID0gcGFyYW1zLnk7XG4gICAgICAgIHZhciBzaXplID0gcGFyYW1zLnNpemUgfHwgMTsgLy8gcmF0aW8gdG8gcmVzaXplIHRvXG4gICAgICAgIHZhciBjZW50ZXJGdXp6eW5lc3MgPSBwYXJhbXMuY2VudGVyRnV6enluZXNzIHx8IDA7IC8vIHJhdGlvIG9mIHdpZHRoL2hlaWdodCB0aGF0IHRoZSBjYXJkIGNhbiBiZSBwbGFjZWQgd2l0aGluXG4gICAgICAgIHZhciByb3RhdGlvbiA9IHBhcmFtcy5yb3RhdGlvbiB8fCAwOyAvLyBkZWdyZWVzIVxuICAgICAgICB2YXIgcm90YXRpb25GdXp6eW5lc3MgPSBwYXJhbXMucm90YXRpb25GdXp6eW5lc3MgfHwgMDsgLy8gZGVncmVlc1xuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGggKiBzaXplO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQgKiBzaXplO1xuXG4gICAgICAgIGlmKGNlbnRlckZ1enp5bmVzcykge1xuICAgICAgICAgICAgdmFyIGZ1enp5UmFkaXVzID0gKHdpZHRoIDwgaGVpZ2h0ID8gd2lkdGggOiBoZWlnaHQpICogY2VudGVyRnV6enluZXNzIC8gMjtcbiAgICAgICAgICAgIHZhciByYWRpdXMgPSBmdXp6eVJhZGl1cyAqIE1hdGguc3FydChNYXRoLnJhbmRvbSgxKSk7XG4gICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLnNxcnQoMiAqIE1hdGguUEkpO1xuXG4gICAgICAgICAgICB4ID0geCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgIHkgPSB5ICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYocm90YXRpb25GdXp6eW5lc3MpIHtcbiAgICAgICAgICAgIHZhciBtaW5Sb3RhdGlvbiA9IHJvdGF0aW9uIC0gcm90YXRpb25GdXp6eW5lc3M7XG4gICAgICAgICAgICB2YXIgbWF4Um90YXRpb24gPSByb3RhdGlvbiArIHJvdGF0aW9uRnV6enluZXNzO1xuICAgICAgICAgICAgcm90YXRpb24gPSBNYXRoLnJhbmRvbSgpICogKDEgKyBtYXhSb3RhdGlvbiAtIG1pblJvdGF0aW9uKSArIG1pblJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyYW5zZm9ybWVyID0gdGhpcy5zY2VuZS53aXRoSW1hZ2UodGhpcy5pbWFnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50cmFuc2xhdGVUb0NlbnRlcih4LCB5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJvdGF0ZURlZ3JlZXMocm90YXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZHJhd0ltYWdlQ2VudGVyZWQod2lkdGgsIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5nZXRUcmFuc2Zvcm1lcigpO1xuICAgICAgICB0aGlzLnNjZW5lLmRvbmUoKTtcblxuICAgICAgICAvLyB0aGUgb3JkZXIgaXMgaW1wb3J0YW50LCBhbmQgd2UgcHVsbCB0aGUgaG92ZXJpbmcgaW4gYSBiaXRcbiAgICAgICAgdmFyIHBhZGRlZFdpZHRoID0gd2lkdGggKiAuOTc7XG4gICAgICAgIHZhciBwYWRkZWRIZWlnaHQgPSBoZWlnaHQgKiAuOTc7XG4gICAgICAgIHRyYW5zZm9ybWF0aW9ucyA9IFsgWy1wYWRkZWRXaWR0aCAvMiwgLXBhZGRlZEhlaWdodCAvIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstcGFkZGVkV2lkdGggLzIsICBwYWRkZWRIZWlnaHQgLyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbIHBhZGRlZFdpZHRoIC8yLCAgcGFkZGVkSGVpZ2h0IC8gMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWyBwYWRkZWRXaWR0aCAvMiwgLXBhZGRlZEhlaWdodCAvIDJdIF07XG5cbiAgICAgICAgdmFyIGNvcm5lcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgdmFyIHBvaW50ID0gdHJhbnNmb3JtZXIudHJhbnNmb3JtUG9pbnQodHJhbnNmb3JtYXRpb25zW2ldWzBdLCB0cmFuc2Zvcm1hdGlvbnNbaV1bMV0pO1xuICAgICAgICAgICAgY29ybmVycy5wdXNoKHsgeDogTWF0aC5yb3VuZChwb2ludFswXSksIHk6IE1hdGgucm91bmQocG9pbnRbMV0pIH0pO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcy5hY3R1YWwgPSB7XG4gICAgICAgICAgICByb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBDYXJkKHsgc3VpdDogdGhpcy5zdWl0LCB2YWx1ZTogdGhpcy52YWx1ZSwgY29ybmVyczogY29ybmVycywgZHJhd1BhcmFtczogcGFyYW1zLCBjYXJkOiB0aGlzIH0pO1xuXG4gICAgfVxufVxuXG4gICAgLypcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5zdWl0ID0gcGFyYW1zLnN1aXQ7XG4gICAgICAgIHRoaXMudmFsdWUgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgIHRoaXMuY29ybmVycyA9IHBhcmFtcy5jb3JuZXJzO1xuICAgICAgICB0aGlzLmNhcmQgPSBwYXJhbXMuY2FyZDtcbiAgICAgICAgdGhpcy5kcmF3UGFyYW1zID0gcGFyYW1zLmRyYXdQYXJhbXM7XG4gICAgfVxuICAgIGlzSG92ZXIocG9zaXRpb24pIHtcbiAgICAgICAgdmFyIHRvcExlZnQgPSB0aGlzLmNvcm5lcnNbMF07XG4gICAgICAgIHZhciBib3R0b21MZWZ0ID0gdGhpcy5jb3JuZXJzWzFdO1xuICAgICAgICB2YXIgYm90dG9tUmlnaHQgPSB0aGlzLmNvcm5lcnNbMl07XG4gICAgICAgIHZhciB0b3BSaWdodCA9IHRoaXMuY29ybmVyc1szXTtcblxuICAgICAgICB2YXIgbGVmdERlbHRhWCA9IGJvdHRvbUxlZnQueCAtIHRvcExlZnQueDtcbiAgICAgICAgdmFyIGxlZnREZWx0YVkgPSBib3R0b21MZWZ0LnkgLSB0b3BMZWZ0Lnk7XG4gICAgICAgIHZhciB0b3BEZWx0YVggPSB0b3BSaWdodC54IC0gdG9wTGVmdC54O1xuICAgICAgICB2YXIgdG9wRGVsdGFZID0gdG9wUmlnaHQueSAtIHRvcExlZnQueTtcblxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcExlZnQueCkgICAgKiBsZWZ0RGVsdGFYICsgKHBvc2l0aW9uLnkgLSB0b3BMZWZ0LnkpICAgICogbGVmdERlbHRhWSA8IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIGJvdHRvbUxlZnQueCkgKiBsZWZ0RGVsdGFYICsgKHBvc2l0aW9uLnkgLSBib3R0b21MZWZ0LnkpICogbGVmdERlbHRhWSA+IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcExlZnQueCkgICAgKiB0b3BEZWx0YVggICsgKHBvc2l0aW9uLnkgLSB0b3BMZWZ0LnkpICAgICogdG9wRGVsdGFZICA8IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBpZigocG9zaXRpb24ueCAtIHRvcFJpZ2h0LngpICAgKiB0b3BEZWx0YVggICsgKHBvc2l0aW9uLnkgLSB0b3BSaWdodC55KSAgICogdG9wRGVsdGFZICA+IDAuMCkgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG5cbi8vICAgICAgICB2YXIgdG9wRGVsdGEgPSAodG9wUmlnaHQueSAtIHRvcExlZnQueSkgLyAodG9wUmlnaHQueCAtIHRvcExlZnQueCk7XG5cbi8vICAgICAgICB0b3BNID0gdG9wTGVmdC55IC0gdG9wRGVsdGEgKiB0b3BMZWZ0Lng7XG4vLyAgICAgICAgY29uc29sZS5sb2cocG9zaXRpb24ueCwgTWF0aC5yb3VuZChwb3NpdGlvbi54ICogdG9wRGVsdGEpLCBNYXRoLnJvdW5kKHRvcE0pLCB0aGlzLmNvcm5lcnMpO1xuICAgIH1cbiAgICByZWRyYXcocGFyYW1zID0ge30pIHtcbiAgICAgICAgdmFyIGFjdHVhbFBhcmFtcyA9IHRoaXMubWl4UGFyYW1zKHBhcmFtcyk7XG4gICAgICAgIHRoaXMuY29ybmVycyA9IHRoaXMuY2FyZC5kcmF3KGFjdHVhbFBhcmFtcykuY29ybmVycztcbiAgICB9XG4gICAgcmVkcmF3T3V0bGluZShwYXJhbXMgPSB7fSkge1xuICAgICAgICB2YXIgYWN0dWFsUGFyYW1zID0gdGhpcy5taXhQYXJhbXMocGFyYW1zKTtcbiAgICAgICAgdmFyIHJhZGl1cyA9IHRoaXMuY2FyZC5pbWFnZS53aWR0aCAqIGFjdHVhbFBhcmFtcy5zaXplIC8gMTA7XG5cbiAgICAgICAgdGhpcy5jYXJkLnNjZW5lLnJvdW5kUmVjdENvcm5lcnModGhpcy5jb3JuZXJzLCByYWRpdXMsIHsgbGluZVdpZHRoOiAxMCwgc3RyaWtlOiBmYWxzZSwgc2hhZG93OiB7IGJsdXI6IDEwLCBjb2xvcjogJyNmMGYnIH19KTtcbiAgICB9XG4gICAgbWl4UGFyYW1zKHBhcmFtcykge1xuICAgICAgICB2YXIgdXNlQWN0dWFsID0gcGFyYW1zLnVzZUFjdHVhbCA/IHBhcmFtcy51c2VBY3R1YWwgOiBmYWxzZTtcbiAgICAgICAgdmFyIGFjdHVhbFBhcmFtcyA9IHtcbiAgICAgICAgICAgIHg6ICh0eXBlb2YgcGFyYW1zLnggPT09ICd1bmRlZmluZWQnID8gdXNlQWN0dWFsID8gdGhpcy5kcmF3UGFyYW1zLmFjdHVhbC54IDogdGhpcy5kcmF3UGFyYW1zLnggOiBwYXJhbXMueCksXG4gICAgICAgICAgICB5OiAodHlwZW9mIHBhcmFtcy55ID09PSAndW5kZWZpbmVkJyA/IHVzZUFjdHVhbCA/IHRoaXMuZHJhd1BhcmFtcy5hY3R1YWwueSA6ICB0aGlzLmRyYXdQYXJhbXMueSA6IHBhcmFtcy55KSxcbiAgICAgICAgICAgIHNpemU6ICh0eXBlb2YgcGFyYW1zLnNpemUgPT09ICd1bmRlZmluZWQnID8gdGhpcy5kcmF3UGFyYW1zLnNpemUgOiBwYXJhbXMuc2l6ZSksICAvLyBpcyBhbHdheXMgYWN0dWFsXG4gICAgICAgICAgICBjZW50ZXJGdXp6eW5lc3M6ICh0eXBlb2YgcGFyYW1zLmNlbnRlckZ1enp5bmVzcyA9PT0gJ3VuZGVmaW5lZCcgPyB1c2VBY3R1YWwgPyAwIDogdGhpcy5kcmF3UGFyYW1zLmNlbnRlckZ1enp5bmVzcyA6IHBhcmFtcy5jZW50ZXJGdXp6eW5lc3MpLFxuICAgICAgICAgICAgcm90YXRpb246ICh0eXBlb2YgcGFyYW1zLnJvdGF0aW9uID09PSAndW5kZWZpbmVkJyA/IHVzZUFjdHVhbCA/IHRoaXMuZHJhd1BhcmFtcy5hY3R1YWwucm90YXRpb24gOiB0aGlzLmRyYXdQYXJhbXMucm90YXRpb24gOiBwYXJhbXMucm90YXRpb24pLFxuICAgICAgICAgICAgcm90YXRpb25GdXp6eW5lc3M6ICh0eXBlb2YgcGFyYW1zLnJvdGF0aW9uRnV6enluZXNzID09PSAndW5kZWZpbmVkJyA/IHVzZUFjdHVhbCA/IDAgOiB0aGlzLmRyYXdQYXJhbXMucm90YXRpb25GdXp6eW5lc3MgOiBwYXJhbXMucm90YXRpb25GdXp6eW5lc3MpLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYWN0dWFsUGFyYW1zO1xuICAgIH1cblxuXG5cblxufVxuKi9cbiJdfQ==;
define('lib/misc/card-generator',['exports', './card'], function (exports, _card) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var CardGenerator = (function () {
        function CardGenerator(params) {
            _classCallCheck(this, CardGenerator);

            this.cardHolder = {};
        }

        _createClass(CardGenerator, [{
            key: 'loadCards',
            value: function loadCards() {
                var _this = this;

                promises = [];
                promises = this.prepareLoadPromises(promises, 'normal', ['clubs', 'diamonds', 'hearts', 'spades'], ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']);
                promises = this.prepareLoadPromises(promises, 'normal', ['back'], ['red', 'blue']);
                promises = this.prepareLoadPromises(promises, 'normal', ['joker'], ['black', 'red']);
                promises = this.prepareLoadPromises(promises, 'small', ['clubs'], ['queen']);

                var allImagesLoaded = Promise.all(promises);

                allImagesLoaded.then(function (result) {

                    for (var i = 0; i < result.length; i++) {
                        var cardImage = result[i];
                        var suit = cardImage.dataset.suit;
                        var value = cardImage.dataset.value;
                        var size = cardImage.dataset.size;
                        if (_this.cardHolder[suit] === undefined) {
                            _this.cardHolder[suit] = {};
                        }
                        if (_this.cardHolder[suit][value] === undefined) {
                            _this.cardHolder[suit][value] = {};
                        }
                        _this.cardHolder[suit][value][size] = cardImage;
                    }
                });
                return allImagesLoaded;
            }
        }, {
            key: 'prepareLoadPromises',
            value: function prepareLoadPromises(promises, size, suits, values) {

                for (var i = 0; i < suits.length; i++) {
                    for (var j = 0; j < values.length; j++) {

                        var suit = suits[i];
                        var value = values[j];

                        var imageLoadPromise = new Promise(function (resolve, reject) {
                            var image = new Image();
                            image.src = '/cards/' + suit + '_' + value + '_' + size + '.png';
                            image.dataset.suit = suit;
                            image.dataset.value = value;
                            image.dataset.size = size;

                            image.onload = function () {
                                resolve(image);
                            };
                        });
                        promises.push(imageLoadPromise);
                    }
                }
                return promises;
            }
        }, {
            key: 'cardHeight',
            value: function cardHeight() {
                return this.card('diamonds', 2).normal.height;
            }
        }, {
            key: 'cardWidth',
            value: function cardWidth() {
                return this.card('diamonds', 2).normal.width;
            }
        }, {
            key: 'card',
            value: function card(suit, value) {
                if (undefined === this.cardHolder[suit] || undefined === this.cardHolder[suit][value]) {
                    console.log('WARNING: undefined card', suit, value);
                    return;
                }
                return this.cardHolder[suit][value];
            }
        }]);

        return CardGenerator;
    })();

    exports.CardGenerator = CardGenerator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvY2FyZC1nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7UUFFYSxhQUFhO0FBQ1gsaUJBREYsYUFBYSxDQUNWLE1BQU0sRUFBRTtrQ0FEWCxhQUFhOztBQUVsQixnQkFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7U0FDeEI7O3FCQUhRLGFBQWE7O21CQUliLHFCQUFHOzs7QUFDUix3QkFBUSxHQUFHLEVBQUUsQ0FBQztBQUNkLHdCQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDakssd0JBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDbkYsd0JBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDckYsd0JBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7QUFFN0Usb0JBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTVDLCtCQUFlLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxFQUFLOztBQUU3Qix5QkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsNEJBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQiw0QkFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbEMsNEJBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQ3BDLDRCQUFJLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNsQyw0QkFBRyxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDcEMsa0NBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzt5QkFDOUI7QUFDRCw0QkFBRyxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDM0Msa0NBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQzt5QkFDckM7QUFDRCw4QkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO3FCQUNsRDtpQkFDSixDQUFDLENBQUM7QUFDSCx1QkFBTyxlQUFlLENBQUM7YUFFMUI7OzttQkFDa0IsNkJBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFOztBQUUvQyxxQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMseUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUVwQyw0QkFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLDRCQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXRCLDRCQUFJLGdCQUFnQixHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUNwRCxnQ0FBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN4QixpQ0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7QUFDakUsaUNBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUMxQixpQ0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzVCLGlDQUFLLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRTFCLGlDQUFLLENBQUMsTUFBTSxHQUFHLFlBQU07QUFDakIsdUNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs2QkFDbEIsQ0FBQzt5QkFDTCxDQUFDLENBQUM7QUFDSCxnQ0FBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUNuQztpQkFDSjtBQUNELHVCQUFPLFFBQVEsQ0FBQzthQUNuQjs7O21CQUNTLHNCQUFHO0FBQ1QsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUNqRDs7O21CQUNRLHFCQUFHO0FBQ1IsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUNoRDs7O21CQUNHLGNBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUNkLG9CQUFHLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2xGLDJCQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwRCwyQkFBTztpQkFDVjtBQUNELHVCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkM7OztlQXBFUSxhQUFhIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvY2FyZC1nZW5lcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYXJkIH0gZnJvbSAnLi9jYXJkJztcblxuZXhwb3J0IGNsYXNzIENhcmRHZW5lcmF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmNhcmRIb2xkZXIgPSB7fTtcbiAgICB9XG4gICAgbG9hZENhcmRzKCkge1xuICAgICAgICBwcm9taXNlcyA9IFtdO1xuICAgICAgICBwcm9taXNlcyA9IHRoaXMucHJlcGFyZUxvYWRQcm9taXNlcyhwcm9taXNlcywgJ25vcm1hbCcsIFsnY2x1YnMnLCAnZGlhbW9uZHMnLCAnaGVhcnRzJywgJ3NwYWRlcyddLCBbJ2FjZScsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAnamFjaycsICdxdWVlbicsICdraW5nJ10pO1xuICAgICAgICBwcm9taXNlcyA9IHRoaXMucHJlcGFyZUxvYWRQcm9taXNlcyhwcm9taXNlcywgJ25vcm1hbCcsIFsnYmFjayddLCBbJ3JlZCcsICdibHVlJ10pO1xuICAgICAgICBwcm9taXNlcyA9IHRoaXMucHJlcGFyZUxvYWRQcm9taXNlcyhwcm9taXNlcywgJ25vcm1hbCcsIFsnam9rZXInXSwgWydibGFjaycsICdyZWQnXSk7XG4gICAgICAgIHByb21pc2VzID0gdGhpcy5wcmVwYXJlTG9hZFByb21pc2VzKHByb21pc2VzLCAnc21hbGwnLCBbJ2NsdWJzJ10sIFsncXVlZW4nXSk7XG5cbiAgICAgICAgdmFyIGFsbEltYWdlc0xvYWRlZCA9IFByb21pc2UuYWxsKHByb21pc2VzKTtcblxuICAgICAgICBhbGxJbWFnZXNMb2FkZWQudGhlbigocmVzdWx0KSA9PiB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcmRJbWFnZSA9IHJlc3VsdFtpXTtcbiAgICAgICAgICAgICAgICB2YXIgc3VpdCA9IGNhcmRJbWFnZS5kYXRhc2V0LnN1aXQ7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gY2FyZEltYWdlLmRhdGFzZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSBjYXJkSW1hZ2UuZGF0YXNldC5zaXplO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2FyZEhvbGRlcltzdWl0XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FyZEhvbGRlcltzdWl0XSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih0aGlzLmNhcmRIb2xkZXJbc3VpdF1bdmFsdWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXJkSG9sZGVyW3N1aXRdW3ZhbHVlXSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRIb2xkZXJbc3VpdF1bdmFsdWVdW3NpemVdID0gY2FyZEltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFsbEltYWdlc0xvYWRlZDtcblxuICAgIH1cbiAgICBwcmVwYXJlTG9hZFByb21pc2VzKHByb21pc2VzLCBzaXplLCBzdWl0cywgdmFsdWVzKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWl0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZXMubGVuZ3RoOyBqKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBzdWl0ID0gc3VpdHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVzW2pdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlTG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSAnL2NhcmRzLycgKyBzdWl0ICsgJ18nICsgdmFsdWUgKyAnXycgKyBzaXplICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5kYXRhc2V0LnN1aXQgPSBzdWl0O1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5kYXRhc2V0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlLmRhdGFzZXQuc2l6ZSA9IHNpemU7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChpbWFnZUxvYWRQcm9taXNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG4gICAgfVxuICAgIGNhcmRIZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhcmQoJ2RpYW1vbmRzJywgMikubm9ybWFsLmhlaWdodDtcbiAgICB9XG4gICAgY2FyZFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXJkKCdkaWFtb25kcycsIDIpLm5vcm1hbC53aWR0aDtcbiAgICB9XG4gICAgY2FyZChzdWl0LCB2YWx1ZSkge1xuICAgICAgICBpZih1bmRlZmluZWQgPT09IHRoaXMuY2FyZEhvbGRlcltzdWl0XSB8fCB1bmRlZmluZWQgPT09IHRoaXMuY2FyZEhvbGRlcltzdWl0XVt2YWx1ZV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiB1bmRlZmluZWQgY2FyZCcsIHN1aXQsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jYXJkSG9sZGVyW3N1aXRdW3ZhbHVlXTtcbiAgICB9XG59XG4iXX0=;
define('lib/misc/utilities',["exports", "module"], function (exports, module) {
    

    function copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }

    module.exports = copyArray;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGFBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUN0QixlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzVDOztxQkFFYyxTQUFTIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvdXRpbGl0aWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY29weUFycmF5KGFycmF5KSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJyYXkpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29weUFycmF5O1xuIl19;
define('lib/misc/group-of-cards',['exports', './utilities', './card'], function (exports, _utilities, _card) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _copyArray = _interopRequireDefault(_utilities);

    var GroupOfCards = (function () {
        function GroupOfCards() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? { groupArea: {}, drawParams: {} } : arguments[0];

            _classCallCheck(this, GroupOfCards);

            this.cardGenerator = params.cardGenerator;
            this.scene = params.scene;
            this.cards = [];
            this.groupArea = {
                leftX: params.groupArea.leftX,
                centerY: params.groupArea.centerY,
                baseRowCenterY: params.groupArea.baseRowCenterY,
                centerX: params.groupArea.centerX,
                maxWidth: params.groupArea.maxWidth,
                maxHeight: params.groupArea.maxHeight
            };
            this.drawParams = {
                baseRotation: params.drawParams.baseRotation || 0,
                rotationFuzzyness: params.drawParams.rotationFuzzyness || 0,
                centerFuzzyness: params.drawParams.centerFuzzyness || 0
            }, this.recalculateCardResizer();
        }

        _createClass(GroupOfCards, [{
            key: 'hasCard',
            value: function hasCard(suit, value) {
                var hasIt = false;
                this.cards.map(function (card) {
                    if (card.suit === suit && card.value === value) {
                        hasIt = true;
                    }
                });
                return hasIt;
            }
        }, {
            key: 'ensureCard',
            value: function ensureCard(suit, value) {
                if (!this.hasCard(suit, value)) {
                    this.addCard(suit, value);
                }
            }
        }, {
            key: 'addCard',
            value: function addCard(suit, value) {
                var addedCard = new _card.Card({
                    suit: suit,
                    value: value,
                    image: this.cardGenerator.card(suit, value),
                    drawParams: this.drawParams,
                    scene: this.scene
                });
                this.cards.push(addedCard);
                this.recalculateCardResizer();
                return addedCard;
            }
        }, {
            key: 'numberOfCards',
            value: function numberOfCards() {
                return this.cards.length;
            }
        }, {
            key: 'maxCardIndex',
            value: function maxCardIndex() {
                return this.cards.length - 1;
            }
        }, {
            key: 'newCardPosition',
            value: function newCardPosition() {
                console.log('group-of-cards/newCardPosition: Implement in subclass');
            }
        }, {
            key: 'sortBy',
            value: function sortBy(_sortBy) {
                if (_sortBy === 'suit') {
                    this.cards.sort(function (a, b) {
                        return a.suitSortable.localeCompare(b.suitSortable);
                    });
                } else if (_sortBy === 'value') {
                    this.cards.sort(function (a, b) {
                        return a.valueSortable.localeCompare(b.valueSortable);
                    });
                }
            }
        }, {
            key: 'markHoverable',
            value: function markHoverable(position) {
                console.log('group-of-cards/markHoverable', 'Implement in sub class.');
            }
        }, {
            key: 'moveHoveredOnto',
            value: function moveHoveredOnto(anotherGroupOfCards, doWithCard) {
                var hoveredIndex;
                for (var i = 0; i < this.cards.length; i += 1) {
                    if (this.cards[i].wasHovering) {
                        hoveredIndex = i;
                    }
                }
                if (hoveredIndex !== undefined) {
                    var movedCard = this.cards.splice(hoveredIndex, 1)[0];
                    var newCard = anotherGroupOfCards.addCard(movedCard.suit, movedCard.value);
                    //  newCard.move = copyArray(movedCard.move);
                    this.recalculateCardResizer();
                    this.rerandomizeAllCards();
                    console.log(typeof doWithCard);
                    if (typeof doWithCard === 'function') {
                        console.log('running dowith');
                        newCard.location = (0, _copyArray['default'])(movedCard.location);
                        doWithCard(newCard);
                    }
                    console.log('new card', newCard, '|', movedCard);
                    return true;
                }
                return false;
            }
        }, {
            key: 'moveCardOnto',
            value: function moveCardOnto(suit, value, anotherGroupOfCards, doWithCard) {
                var wantedIndex;
                for (var i = 0; i < this.cards.length; i += 1) {
                    if (this.cards[i].suit === suit && this.cards[i].value === value) {
                        wantedIndex = i;
                        break;
                    }
                }
                if (wantedIndex !== undefined) {
                    var movedCard = this.cards.splice(wantedIndex, 1)[0];
                    var newCard = anotherGroupOfCards.addCard(movedCard.suit, movedCard.value);
                    //  newCard.move = copyArray(movedCard.move);
                    this.recalculateCardResizer();
                    this.rerandomizeAllCards();
                    console.log(typeof doWithCard);
                    if (typeof doWithCard === 'function') {
                        console.log('running dowith');
                        newCard.location = (0, _copyArray['default'])(movedCard.location);
                        doWithCard(newCard);
                    }
                    console.log('new card', newCard, '|', movedCard);
                    return true;
                }
                return false;
            }
        }, {
            key: 'dealTopCardOnto',
            value: function dealTopCardOnto(anotherGroupOfCards, doWithCard, suit, value) {
                var dealtCard = this.cards.pop();
                var newCard = anotherGroupOfCards.addCard;
            }
        }, {
            key: 'rerandomizeAllCards',
            value: function rerandomizeAllCards() {
                this.cards.map(function (card) {
                    return card.rerandomize();
                });
            }
        }, {
            key: 'replacePrivateCard',
            value: function replacePrivateCard() {
                var newCards = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

                for (var i = 0; i < newCards.length; i += 1) {
                    var oldCard = this.cards.pop();
                    var newCard = this.addCard(newCards[i].suit, newCards[i].value);
                    newCard.location = (0, _copyArray['default'])(oldCard.location);
                }
            }
        }, {
            key: 'replaceAllPublicCards',
            value: function replaceAllPublicCards(backColor) {
                var howMany = this.cards.length - 1;
                for (var i = 0; i <= howMany; i += 1) {
                    var oldCard = this.cards.shift();
                    var newCard = this.addCard('back', backColor);
                    newCard.location = (0, _copyArray['default'])(oldCard.location);
                }
            }
        }]);

        return GroupOfCards;
    })();

    exports.GroupOfCards = GroupOfCards;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsWUFBWTtBQUNWLGlCQURGLFlBQVksR0FDbUM7Z0JBQTVDLE1BQU0seURBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7O2tDQUQ3QyxZQUFZOztBQUVqQixnQkFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQzFDLGdCQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDMUIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLGdCQUFJLENBQUMsU0FBUyxHQUFHO0FBQ2IscUJBQUssRUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUs7QUFDakMsdUJBQU8sRUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU87QUFDbkMsOEJBQWMsRUFBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWM7QUFDaEQsdUJBQU8sRUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU87QUFDbkMsd0JBQVEsRUFBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVE7QUFDcEMseUJBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVM7YUFDeEMsQ0FBQztBQUNGLGdCQUFJLENBQUMsVUFBVSxHQUFHO0FBQ2QsNEJBQVksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxDQUFDO0FBQ2pELGlDQUFpQixFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLElBQUksQ0FBQztBQUMzRCwrQkFBZSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxJQUFJLENBQUM7YUFDMUQsRUFFRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNqQzs7cUJBcEJRLFlBQVk7O21CQXFCZCxpQkFBQyxJQUFJLEVBQUUsS0FBSyxF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QUFDNUIscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDekMsd0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDL0Isd0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEUsMkJBQU8sQ0FBQyxRQUFRLEdBQUcsMkJBQVUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRDthQUNKOzs7bUJBQ29CLCtCQUFDLFNBQVMsRUFBRTtBQUM3QixvQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbEMsd0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsd0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLDJCQUFPLENBQUMsUUFBUSxHQUFHLDJCQUFVLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEQ7YUFDSjs7O2VBbElRLFlBQVkiLCJmaWxlIjoiZ3NyYy9saWIvbWlzYy9ncm91cC1vZi1jYXJkcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb3B5QXJyYXkgZnJvbSAnLi91dGlsaXRpZXMnO1xuaW1wb3J0IHsgQ2FyZCB9IGZyb20gJy4vY2FyZCc7XG5cbmV4cG9ydCBjbGFzcyBHcm91cE9mQ2FyZHMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHsgZ3JvdXBBcmVhOiB7fSwgZHJhd1BhcmFtczoge30gfSkge1xuICAgICAgICB0aGlzLmNhcmRHZW5lcmF0b3IgPSBwYXJhbXMuY2FyZEdlbmVyYXRvcjtcbiAgICAgICAgdGhpcy5zY2VuZSA9IHBhcmFtcy5zY2VuZTtcbiAgICAgICAgdGhpcy5jYXJkcyA9IFtdO1xuICAgICAgICB0aGlzLmdyb3VwQXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnRYOiAgICAgcGFyYW1zLmdyb3VwQXJlYS5sZWZ0WCxcbiAgICAgICAgICAgIGNlbnRlclk6ICAgcGFyYW1zLmdyb3VwQXJlYS5jZW50ZXJZLFxuICAgICAgICAgICAgYmFzZVJvd0NlbnRlclk6ICBwYXJhbXMuZ3JvdXBBcmVhLmJhc2VSb3dDZW50ZXJZLFxuICAgICAgICAgICAgY2VudGVyWDogICBwYXJhbXMuZ3JvdXBBcmVhLmNlbnRlclgsXG4gICAgICAgICAgICBtYXhXaWR0aDogIHBhcmFtcy5ncm91cEFyZWEubWF4V2lkdGgsXG4gICAgICAgICAgICBtYXhIZWlnaHQ6IHBhcmFtcy5ncm91cEFyZWEubWF4SGVpZ2h0LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRyYXdQYXJhbXMgPSB7XG4gICAgICAgICAgICBiYXNlUm90YXRpb246IHBhcmFtcy5kcmF3UGFyYW1zLmJhc2VSb3RhdGlvbiB8fCAwLFxuICAgICAgICAgICAgcm90YXRpb25GdXp6eW5lc3M6IHBhcmFtcy5kcmF3UGFyYW1zLnJvdGF0aW9uRnV6enluZXNzIHx8IDAsXG4gICAgICAgICAgICBjZW50ZXJGdXp6eW5lc3M6IHBhcmFtcy5kcmF3UGFyYW1zLmNlbnRlckZ1enp5bmVzcyB8fCAwLFxuICAgICAgICB9LFxuXG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVDYXJkUmVzaXplcigpO1xuICAgIH1cbiAgICBoYXNDYXJkKHN1aXQsIHZhbHVlKSB7XG4gICAgICAgIHZhciBoYXNJdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhcmRzLm1hcCgoY2FyZCkgPT4geyBpZihjYXJkLnN1aXQgPT09IHN1aXQgJiYgY2FyZC52YWx1ZSA9PT0gdmFsdWUpIHsgaGFzSXQgPSB0cnVlOyB9IH0pO1xuICAgICAgICByZXR1cm4gaGFzSXQ7XG4gICAgfVxuICAgIGVuc3VyZUNhcmQoc3VpdCwgdmFsdWUpIHtcbiAgICAgICAgaWYoIXRoaXMuaGFzQ2FyZChzdWl0LCB2YWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2FyZChzdWl0LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkQ2FyZChzdWl0LCB2YWx1ZSkge1xuICAgICAgICB2YXIgYWRkZWRDYXJkID0gbmV3IENhcmQoe1xuICAgICAgICAgICAgc3VpdDogc3VpdCxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGltYWdlOiB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZChzdWl0LCB2YWx1ZSksXG4gICAgICAgICAgICBkcmF3UGFyYW1zOiB0aGlzLmRyYXdQYXJhbXMsXG4gICAgICAgICAgICBzY2VuZTogdGhpcy5zY2VuZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2FyZHMucHVzaChhZGRlZENhcmQpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlQ2FyZFJlc2l6ZXIoKTtcbiAgICAgICAgcmV0dXJuIGFkZGVkQ2FyZDtcbiAgICB9XG4gICAgbnVtYmVyT2ZDYXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FyZHMubGVuZ3RoO1xuICAgIH1cbiAgICBtYXhDYXJkSW5kZXgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhcmRzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIG5ld0NhcmRQb3NpdGlvbigpIHsgY29uc29sZS5sb2coJ2dyb3VwLW9mLWNhcmRzL25ld0NhcmRQb3NpdGlvbjogSW1wbGVtZW50IGluIHN1YmNsYXNzJyk7IH1cbiAgICBzb3J0Qnkoc29ydEJ5KSB7XG4gICAgICAgIGlmKHNvcnRCeSA9PT0gJ3N1aXQnKSB7XG4gICAgICAgICAgICB0aGlzLmNhcmRzLnNvcnQoKGEsIGIpID0+IGEuc3VpdFNvcnRhYmxlLmxvY2FsZUNvbXBhcmUoYi5zdWl0U29ydGFibGUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNvcnRCeSA9PT0gJ3ZhbHVlJykge1xuICAgICAgICAgICAgdGhpcy5jYXJkcy5zb3J0KChhLCBiKSA9PiBhLnZhbHVlU29ydGFibGUubG9jYWxlQ29tcGFyZShiLnZhbHVlU29ydGFibGUpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtYXJrSG92ZXJhYmxlKHBvc2l0aW9uKSB7IGNvbnNvbGUubG9nKCdncm91cC1vZi1jYXJkcy9tYXJrSG92ZXJhYmxlJywgJ0ltcGxlbWVudCBpbiBzdWIgY2xhc3MuJykgfVxuXG4gICAgbW92ZUhvdmVyZWRPbnRvKGFub3RoZXJHcm91cE9mQ2FyZHMsIGRvV2l0aENhcmQpIHtcbiAgICAgICAgdmFyIGhvdmVyZWRJbmRleDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZih0aGlzLmNhcmRzW2ldLndhc0hvdmVyaW5nKSB7XG4gICAgICAgICAgICAgICAgaG92ZXJlZEluZGV4ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihob3ZlcmVkSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIG1vdmVkQ2FyZCA9ICh0aGlzLmNhcmRzLnNwbGljZShob3ZlcmVkSW5kZXgsIDEpKVswXTtcbiAgICAgICAgICAgIHZhciBuZXdDYXJkID0gYW5vdGhlckdyb3VwT2ZDYXJkcy5hZGRDYXJkKG1vdmVkQ2FyZC5zdWl0LCBtb3ZlZENhcmQudmFsdWUpO1xuICAgICAgICAgIC8vICBuZXdDYXJkLm1vdmUgPSBjb3B5QXJyYXkobW92ZWRDYXJkLm1vdmUpO1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUNhcmRSZXNpemVyKCk7XG4gICAgICAgICAgICB0aGlzLnJlcmFuZG9taXplQWxsQ2FyZHMoKTtcbiAgICAgICAgY29uc29sZS5sb2codHlwZW9mIGRvV2l0aENhcmQpO1xuICAgICAgICAgICAgaWYodHlwZW9mIGRvV2l0aENhcmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncnVubmluZyBkb3dpdGgnKTtcbiAgICAgICAgICAgICAgICBuZXdDYXJkLmxvY2F0aW9uID0gY29weUFycmF5KG1vdmVkQ2FyZC5sb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgZG9XaXRoQ2FyZChuZXdDYXJkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCduZXcgY2FyZCcsIG5ld0NhcmQsICd8JywgIG1vdmVkQ2FyZCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG1vdmVDYXJkT250byhzdWl0LCB2YWx1ZSwgYW5vdGhlckdyb3VwT2ZDYXJkcywgZG9XaXRoQ2FyZCkge1xuICAgICAgICB2YXIgd2FudGVkSW5kZXg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYodGhpcy5jYXJkc1tpXS5zdWl0ID09PSBzdWl0ICYmIHRoaXMuY2FyZHNbaV0udmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgd2FudGVkSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHdhbnRlZEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBtb3ZlZENhcmQgPSAodGhpcy5jYXJkcy5zcGxpY2Uod2FudGVkSW5kZXgsIDEpKVswXTtcbiAgICAgICAgICAgIHZhciBuZXdDYXJkID0gYW5vdGhlckdyb3VwT2ZDYXJkcy5hZGRDYXJkKG1vdmVkQ2FyZC5zdWl0LCBtb3ZlZENhcmQudmFsdWUpO1xuICAgICAgICAgIC8vICBuZXdDYXJkLm1vdmUgPSBjb3B5QXJyYXkobW92ZWRDYXJkLm1vdmUpO1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUNhcmRSZXNpemVyKCk7XG4gICAgICAgICAgICB0aGlzLnJlcmFuZG9taXplQWxsQ2FyZHMoKTtcbiAgICAgICAgY29uc29sZS5sb2codHlwZW9mIGRvV2l0aENhcmQpO1xuICAgICAgICAgICAgaWYodHlwZW9mIGRvV2l0aENhcmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncnVubmluZyBkb3dpdGgnKTtcbiAgICAgICAgICAgICAgICBuZXdDYXJkLmxvY2F0aW9uID0gY29weUFycmF5KG1vdmVkQ2FyZC5sb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgZG9XaXRoQ2FyZChuZXdDYXJkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCduZXcgY2FyZCcsIG5ld0NhcmQsICd8JywgIG1vdmVkQ2FyZCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGRlYWxUb3BDYXJkT250byhhbm90aGVyR3JvdXBPZkNhcmRzLCBkb1dpdGhDYXJkLCBzdWl0LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGVhbHRDYXJkID0gdGhpcy5jYXJkcy5wb3AoKTtcbiAgICAgICAgdmFyIG5ld0NhcmQgPSBhbm90aGVyR3JvdXBPZkNhcmRzLmFkZENhcmRcbiAgICB9XG4gICAgcmVyYW5kb21pemVBbGxDYXJkcygpIHtcbiAgICAgICAgdGhpcy5jYXJkcy4gbWFwKChjYXJkKSA9PiBjYXJkLnJlcmFuZG9taXplKCkpO1xuICAgIH1cbiAgICByZXBsYWNlUHJpdmF0ZUNhcmQobmV3Q2FyZHMgPSBbXSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld0NhcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2FyZCA9IHRoaXMuY2FyZHMucG9wKCk7XG4gICAgICAgICAgICB2YXIgbmV3Q2FyZCA9IHRoaXMuYWRkQ2FyZChuZXdDYXJkc1tpXS5zdWl0LCBuZXdDYXJkc1tpXS52YWx1ZSk7XG4gICAgICAgICAgICBuZXdDYXJkLmxvY2F0aW9uID0gY29weUFycmF5KG9sZENhcmQubG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcGxhY2VBbGxQdWJsaWNDYXJkcyhiYWNrQ29sb3IpIHtcbiAgICAgICAgdmFyIGhvd01hbnkgPSB0aGlzLmNhcmRzLmxlbmd0aCAtIDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IGhvd01hbnk7IGkgKz0gMSkge1xuICAgICAgICAgICAgdmFyIG9sZENhcmQgPSB0aGlzLmNhcmRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgbmV3Q2FyZCA9IHRoaXMuYWRkQ2FyZCgnYmFjaycsIGJhY2tDb2xvcik7XG4gICAgICAgICAgICBuZXdDYXJkLmxvY2F0aW9uID0gY29weUFycmF5KG9sZENhcmQubG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19;
define('lib/misc/group-of-cards.hand',['exports', './group-of-cards', './utilities'], function (exports, _groupOfCards, _utilities) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var _copyArray = _interopRequireDefault(_utilities);

    var Hand = (function (_GroupOfCards) {
        _inherits(Hand, _GroupOfCards);

        function Hand() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? { groupArea: {}, drawParams: {} } : arguments[0];

            _classCallCheck(this, Hand);

            _get(Object.getPrototypeOf(Hand.prototype), 'constructor', this).call(this, params);
        }

        _createClass(Hand, [{
            key: 'recalculateCardResizer',
            value: function recalculateCardResizer() {
                var defaultCardHeight = this.cardGenerator.cardHeight();
                var defaultCardWidth = this.cardGenerator.cardWidth();

                var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight;
                var resizeToFitWidth = this.groupArea.maxWidth / (this.numberOfCards() + 1) / defaultCardWidth * 2; // 2, because the cards overlap

                this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
            }
        }, {
            key: 'draw',
            value: function draw() {
                var firstX = this.groupArea.leftX + this.cardGenerator.cardWidth() * this.cardResizer / 2;
                //    this.scene.ctx.strokeRect(this.groupArea.leftX, this.groupArea.centerY - this.cardGenerator.cardHeight() * this.cardResizer / 2, this.groupArea.maxWidth, this.groupArea.maxHeight);

                for (var i = 0; i <= this.maxCardIndex(); i++) {
                    var card = this.cards[i];

                    card.setLocation({
                        x: firstX + i * this.cardGenerator.cardWidth() * this.cardResizer / 2,
                        y: this.groupArea.centerY
                    });
                    card.draw({ resizer: this.cardResizer });
                }
            }
        }, {
            key: 'markHoverable',
            value: function markHoverable(position) {
                this.cards.map(function (card) {
                    return card.wasHovering = false;
                });
                for (var i = this.cards.length - 1; i >= 0; i -= 1) {
                    var card = this.cards[i];

                    if (card.isHover(position)) {
                        card.wasHovering = true;
                        return card;
                    }
                };
            }
        }, {
            key: 'newCardPosition',
            value: function newCardPosition() {
                var firstX = this.groupArea.leftX + this.cardGenerator.cardWidth() * this.cardResizer / 2;
                return {
                    x: firstX + this.cards.length * this.cardGenerator.cardWidth() * this.cardResizer / 2,
                    y: this.groupArea.centerY
                };
            }
        }]);

        return Hand;
    })(_groupOfCards.GroupOfCards);

    exports.Hand = Hand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMuaGFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsSUFBSTtrQkFBSixJQUFJOztBQUNGLGlCQURGLElBQUksR0FDMkM7Z0JBQTVDLE1BQU0seURBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7O2tDQUQ3QyxJQUFJOztBQUVULHVDQUZLLElBQUksNkNBRUgsTUFBTSxFQUFFO1NBQ2pCOztxQkFIUSxJQUFJOzttQkFJUyxrQ0FBRztBQUNyQixvQkFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hELG9CQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXRELG9CQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDO0FBQ3JFLG9CQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLGdCQUFnQixHQUFHLENBQUMsQ0FBQTs7QUFFbEcsb0JBQUksQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLEdBQUcsaUJBQWlCLEdBQUcsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUM7YUFDbEc7OzttQkFDRyxnQkFBRztBQUNILG9CQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDOzs7QUFHMUYscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0Msd0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXpCLHdCQUFJLENBQUMsV0FBVyxDQUFDO0FBQ2IseUJBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO0FBQ3JFLHlCQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO3FCQUM1QixDQUFDLENBQUM7QUFDSCx3QkFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDNUM7YUFDSjs7O21CQUNZLHVCQUFDLFFBQVEsRUFBRTtBQUNwQixvQkFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJOzJCQUFLLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSztpQkFBQSxDQUFDLENBQUM7QUFDbkQscUJBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoRCx3QkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFekIsd0JBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN2Qiw0QkFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsK0JBQU8sSUFBSSxDQUFDO3FCQUNmO2lCQUNKLENBQUM7YUFDTDs7O21CQUNjLDJCQUFHO0FBQ2Qsb0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDMUYsdUJBQU87QUFDSCxxQkFBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztBQUNyRixxQkFBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztpQkFDNUIsQ0FBQzthQUNMOzs7ZUE1Q1EsSUFBSTtxQkFIUixZQUFZIiwiZmlsZSI6ImdzcmMvbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMuaGFuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdyb3VwT2ZDYXJkcyB9IGZyb20gJy4vZ3JvdXAtb2YtY2FyZHMnO1xuaW1wb3J0IGNvcHlBcnJheSBmcm9tICcuL3V0aWxpdGllcyc7XG5cbmV4cG9ydCBjbGFzcyBIYW5kIGV4dGVuZHMgR3JvdXBPZkNhcmRzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7IGdyb3VwQXJlYToge30sIGRyYXdQYXJhbXM6IHt9IH0pIHtcbiAgICAgICAgc3VwZXIocGFyYW1zKTtcbiAgICB9XG4gICAgcmVjYWxjdWxhdGVDYXJkUmVzaXplcigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkSGVpZ2h0ID0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKTtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkV2lkdGggPSB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZFdpZHRoKCk7XG5cbiAgICAgICAgdmFyIHJlc2l6ZVRvRml0SGVpZ2h0ID0gdGhpcy5ncm91cEFyZWEubWF4SGVpZ2h0IC8gZGVmYXVsdENhcmRIZWlnaHQ7XG4gICAgICAgIHZhciByZXNpemVUb0ZpdFdpZHRoID0gdGhpcy5ncm91cEFyZWEubWF4V2lkdGggLyAodGhpcy5udW1iZXJPZkNhcmRzKCkgKyAxKSAvIGRlZmF1bHRDYXJkV2lkdGggKiAyIC8vIDIsIGJlY2F1c2UgdGhlIGNhcmRzIG92ZXJsYXBcblxuICAgICAgICB0aGlzLmNhcmRSZXNpemVyID0gcmVzaXplVG9GaXRXaWR0aCA8IHJlc2l6ZVRvRml0SGVpZ2h0ID8gcmVzaXplVG9GaXRXaWR0aCA6IHJlc2l6ZVRvRml0SGVpZ2h0O1xuICAgIH1cbiAgICBkcmF3KCkge1xuICAgICAgICB2YXIgZmlyc3RYID0gdGhpcy5ncm91cEFyZWEubGVmdFggKyB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZFdpZHRoKCkgKiB0aGlzLmNhcmRSZXNpemVyIC8gMjtcbiAgICAvLyAgICB0aGlzLnNjZW5lLmN0eC5zdHJva2VSZWN0KHRoaXMuZ3JvdXBBcmVhLmxlZnRYLCB0aGlzLmdyb3VwQXJlYS5jZW50ZXJZIC0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKSAqIHRoaXMuY2FyZFJlc2l6ZXIgLyAyLCB0aGlzLmdyb3VwQXJlYS5tYXhXaWR0aCwgdGhpcy5ncm91cEFyZWEubWF4SGVpZ2h0KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLm1heENhcmRJbmRleCgpOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYXJkID0gdGhpcy5jYXJkc1tpXTtcblxuICAgICAgICAgICAgY2FyZC5zZXRMb2NhdGlvbih7XG4gICAgICAgICAgICAgICAgeDogZmlyc3RYICsgaSAqIHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkV2lkdGgoKSAqIHRoaXMuY2FyZFJlc2l6ZXIgLyAyLFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuZ3JvdXBBcmVhLmNlbnRlcllcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FyZC5kcmF3KHsgcmVzaXplcjogdGhpcy5jYXJkUmVzaXplciB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtYXJrSG92ZXJhYmxlKHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FyZHMubWFwKChjYXJkKSA9PiBjYXJkLndhc0hvdmVyaW5nID0gZmFsc2UpO1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5jYXJkcy5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgdmFyIGNhcmQgPSB0aGlzLmNhcmRzW2ldO1xuXG4gICAgICAgICAgICBpZihjYXJkLmlzSG92ZXIocG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgY2FyZC53YXNIb3ZlcmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhcmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIG5ld0NhcmRQb3NpdGlvbigpIHtcbiAgICAgICAgdmFyIGZpcnN0WCA9IHRoaXMuZ3JvdXBBcmVhLmxlZnRYICsgdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRXaWR0aCgpICogdGhpcy5jYXJkUmVzaXplciAvIDI7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBmaXJzdFggKyB0aGlzLmNhcmRzLmxlbmd0aCAqIHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkV2lkdGgoKSAqIHRoaXMuY2FyZFJlc2l6ZXIgLyAyLFxuICAgICAgICAgICAgeTogdGhpcy5ncm91cEFyZWEuY2VudGVyWSxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=;
define('lib/misc/group-of-cards.stack',['exports', './group-of-cards'], function (exports, _groupOfCards) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Stack = (function (_GroupOfCards) {
        _inherits(Stack, _GroupOfCards);

        function Stack() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? { groupArea: {}, drawParams: {} } : arguments[0];

            _classCallCheck(this, Stack);

            _get(Object.getPrototypeOf(Stack.prototype), 'constructor', this).call(this, params);
        }

        _createClass(Stack, [{
            key: 'recalculateCardResizer',
            value: function recalculateCardResizer() {
                var defaultCardHeight = this.cardGenerator.cardHeight();
                var defaultCardWidth = this.cardGenerator.cardWidth();

                var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight;
                var resizeToFitWidth = this.groupArea.maxWidth / defaultCardWidth;

                this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
            }
        }, {
            key: 'draw',
            value: function draw() {
                //   this.scene.ctx.strokeRect(this.groupArea.leftX, this.groupArea.centerY - this.cardGenerator.cardHeight() * this.cardResizer / 2, this.groupArea.maxWidth, this.groupArea.maxHeight);
                for (var i = 0; i <= this.maxCardIndex(); i++) {
                    var card = this.cards[i];
                    var x = this.groupArea.leftX !== undefined ? this.groupArea.leftX + this.cardGenerator.cardWidth() * this.cardResizer / 2 : this.groupArea.centerX !== undefined ? this.groupArea.centerX : 0;
                    card.setLocation({
                        x: x,
                        y: this.groupArea.centerY
                    });
                    card.draw({ resizer: this.cardResizer });
                }
            }
        }, {
            key: 'newCardPosition',
            value: function newCardPosition() {
                return {
                    x: this.groupArea.leftX + this.cardResizer * this.cardGenerator.cardWidth() / 2,
                    y: this.groupArea.centerY
                };
            }
        }, {
            key: 'markHoverable',
            value: function markHoverable(position) {
                if (!this.cards.length) {
                    return;
                }
                var topCard = this.cards[this.cards.length - 1];

                if (topCard.isHover(position)) {
                    topCard.wasHovering = true;
                    return topCard;
                } else {
                    topCard.wasHovering = false;
                    return;
                }
                //topCard.wasHovering = topCard.wasHovering && !topCard.isHover(position) ? false
                //                    :  topCard.isHover(position)                        ? true
                //                    :                                                     false
                //                    ;
            }
        }]);

        return Stack;
    })(_groupOfCards.GroupOfCards);

    exports.Stack = Stack;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMuc3RhY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsS0FBSztrQkFBTCxLQUFLOztBQUNILGlCQURGLEtBQUssR0FDMEM7Z0JBQTVDLE1BQU0seURBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUU7O2tDQUQ3QyxLQUFLOztBQUViLHVDQUZRLEtBQUssNkNBRVAsTUFBTSxFQUFFO1NBQ2Q7O3FCQUhRLEtBQUs7O21CQUlRLGtDQUFHO0FBQ3JCLG9CQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEQsb0JBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFdEQsb0JBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFDckUsb0JBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUksZ0JBQWdCLENBQUM7O0FBRW5FLG9CQUFJLENBQUMsV0FBVyxHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO2FBQ2xHOzs7bUJBQ0csZ0JBQUc7O0FBRUgscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0Msd0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsd0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUNqSCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQ3JCLENBQUMsQ0FDMUM7QUFDUCx3QkFBSSxDQUFDLFdBQVcsQ0FBQztBQUNiLHlCQUFDLEVBQUUsQ0FBQztBQUNKLHlCQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO3FCQUM1QixDQUFDLENBQUM7QUFDSCx3QkFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDNUM7YUFDSjs7O21CQUNjLDJCQUFHO0FBQ2QsdUJBQU87QUFDSCxxQkFBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0FBQy9FLHFCQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO2lCQUM1QixDQUFDO2FBQ0w7OzttQkFDWSx1QkFBQyxRQUFRLEVBQUU7QUFDcEIsb0JBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNuQiwyQkFBTztpQkFDVjtBQUNELG9CQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVoRCxvQkFBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzFCLDJCQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUMzQiwyQkFBTyxPQUFPLENBQUM7aUJBQ2xCLE1BQ0k7QUFDRCwyQkFBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsMkJBQU87aUJBQ1Y7Ozs7O2FBTUo7OztlQXJEUSxLQUFLO3FCQUZULFlBQVkiLCJmaWxlIjoiZ3NyYy9saWIvbWlzYy9ncm91cC1vZi1jYXJkcy5zdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdyb3VwT2ZDYXJkcyB9IGZyb20gJy4vZ3JvdXAtb2YtY2FyZHMnO1xuXG5leHBvcnQgY2xhc3MgU3RhY2sgZXh0ZW5kcyBHcm91cE9mQ2FyZHMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHsgZ3JvdXBBcmVhOiB7fSwgZHJhd1BhcmFtczoge30gfSkge1xuICAgIFx0c3VwZXIocGFyYW1zKTtcbiAgICB9XG4gICAgcmVjYWxjdWxhdGVDYXJkUmVzaXplcigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkSGVpZ2h0ID0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKTtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkV2lkdGggPSB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZFdpZHRoKCk7XG5cbiAgICAgICAgdmFyIHJlc2l6ZVRvRml0SGVpZ2h0ID0gdGhpcy5ncm91cEFyZWEubWF4SGVpZ2h0IC8gZGVmYXVsdENhcmRIZWlnaHQ7XG4gICAgICAgIHZhciByZXNpemVUb0ZpdFdpZHRoID0gdGhpcy5ncm91cEFyZWEubWF4V2lkdGggLyAgZGVmYXVsdENhcmRXaWR0aDtcblxuICAgICAgICB0aGlzLmNhcmRSZXNpemVyID0gcmVzaXplVG9GaXRXaWR0aCA8IHJlc2l6ZVRvRml0SGVpZ2h0ID8gcmVzaXplVG9GaXRXaWR0aCA6IHJlc2l6ZVRvRml0SGVpZ2h0O1xuICAgIH1cbiAgICBkcmF3KCkge1xuICAgICAvLyAgIHRoaXMuc2NlbmUuY3R4LnN0cm9rZVJlY3QodGhpcy5ncm91cEFyZWEubGVmdFgsIHRoaXMuZ3JvdXBBcmVhLmNlbnRlclkgLSB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZEhlaWdodCgpICogdGhpcy5jYXJkUmVzaXplciAvIDIsIHRoaXMuZ3JvdXBBcmVhLm1heFdpZHRoLCB0aGlzLmdyb3VwQXJlYS5tYXhIZWlnaHQpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLm1heENhcmRJbmRleCgpOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYXJkID0gdGhpcy5jYXJkc1tpXTtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5ncm91cEFyZWEubGVmdFggIT09IHVuZGVmaW5lZCA/IHRoaXMuZ3JvdXBBcmVhLmxlZnRYICsgdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRXaWR0aCgpICogdGhpcy5jYXJkUmVzaXplciAvIDJcbiAgICAgICAgICAgICAgICAgIDogdGhpcy5ncm91cEFyZWEuY2VudGVyWCAhPT0gdW5kZWZpbmVkID8gdGhpcy5ncm91cEFyZWEuY2VudGVyWFxuICAgICAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgY2FyZC5zZXRMb2NhdGlvbih7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLmdyb3VwQXJlYS5jZW50ZXJZLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXJkLmRyYXcoeyByZXNpemVyOiB0aGlzLmNhcmRSZXNpemVyIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5ld0NhcmRQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMuZ3JvdXBBcmVhLmxlZnRYICsgdGhpcy5jYXJkUmVzaXplciAqIHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkV2lkdGgoKSAvIDIsXG4gICAgICAgICAgICB5OiB0aGlzLmdyb3VwQXJlYS5jZW50ZXJZLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBtYXJrSG92ZXJhYmxlKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmKCF0aGlzLmNhcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b3BDYXJkID0gdGhpcy5jYXJkc1t0aGlzLmNhcmRzLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGlmKHRvcENhcmQuaXNIb3Zlcihwb3NpdGlvbikpIHtcbiAgICAgICAgICAgIHRvcENhcmQud2FzSG92ZXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRvcENhcmQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0b3BDYXJkLndhc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy90b3BDYXJkLndhc0hvdmVyaW5nID0gdG9wQ2FyZC53YXNIb3ZlcmluZyAmJiAhdG9wQ2FyZC5pc0hvdmVyKHBvc2l0aW9uKSA/IGZhbHNlXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICA6ICB0b3BDYXJkLmlzSG92ZXIocG9zaXRpb24pICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgO1xuXG4gICAgfVxufVxuIl19;
define('lib/misc/group-of-cards.pyramid',['exports', './card', './group-of-cards.stack', './group-of-cards'], function (exports, _card, _groupOfCardsStack, _groupOfCards) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Pyramid = (function (_GroupOfCards) {
        _inherits(Pyramid, _GroupOfCards);

        function Pyramid() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? { groupArea: {}, drawParams: {} } : arguments[0];

            _classCallCheck(this, Pyramid);

            _get(Object.getPrototypeOf(Pyramid.prototype), 'constructor', this).call(this, params);
            this.cards = [];
            this.groupArea.direction = params.groupArea.direction; // normal / inverted
            this.setupCardStacks();
            console.log(this);
        }

        _createClass(Pyramid, [{
            key: 'setupCardStacks',
            value: function setupCardStacks() {
                var actualCardWidth = this.cardGenerator.cardWidth() * this.cardResizer;
                var actualCardHeight = this.cardGenerator.cardHeight() * this.cardResizer;

                var y = this.groupArea.baseRowCenterY; //this.groupArea.centerY + actualCardHeight;
                var yDelta = this.groupArea.direction === 'normal' ? -actualCardHeight / 3 : actualCardHeight / 3;
                var baseX = this.groupArea.centerX - 2 * actualCardWidth;

                for (var rowIndex = 0; rowIndex <= 4; rowIndex++) {
                    this.cards[rowIndex] = [];

                    CARD: for (var cardIndex = 0; cardIndex < 5 - rowIndex; cardIndex++) {
                        var x = baseX + actualCardWidth * 0.6 + actualCardWidth * 0.5 * rowIndex + actualCardWidth * 1.05 * cardIndex;
                        this.cards[rowIndex][cardIndex] = new _groupOfCardsStack.Stack({
                            scene: this.scene,
                            cardGenerator: this.cardGenerator,
                            groupArea: {
                                centerX: x,
                                centerY: y,
                                maxWidth: 200,
                                maxHeight: actualCardHeight
                            },
                            drawParams: {
                                width: 350,
                                baseRotation: 0,
                                rotationFuzzyness: 3,
                                centerFuzzyness: 0.03
                            }
                        });
                    }
                    y = y + yDelta;
                }
            }
        }, {
            key: 'recalculateCardResizer',
            value: function recalculateCardResizer() {
                var defaultCardHeight = this.cardGenerator.cardHeight();
                var defaultCardWidth = this.cardGenerator.cardWidth();

                var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight / 2.2;
                var resizeToFitWidth = this.groupArea.maxWidth / (this.numberOfCards() + 1) / defaultCardWidth * 2; // 2, because the cards overlap

                this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
            }

            // row 1 has five cards, row 5 has one.
        }, {
            key: 'addCard',
            value: function addCard(row, place, suit, value) {
                if (suit !== undefined) {
                    this.cards[row][place].addCard(suit, value);
                    //this.cards[row][place].push(new Card({
                    //    suit: suit,
                    //    value: value,
                    //    image: this.cardGenerator.card(suit, value),
                    //    drawParams: this.drawParams,
                    //    scene: this.scene,
                    //}));
                }
                this.recalculateCardResizer();
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var i = 0; i < this.cards.length; i += 1) {
                    var row = this.cards[i];

                    for (var j = 0; j < row.length; j += 1) {
                        var cardStack = row[j];
                        cardStack.draw();
                    }
                }
                /*var actualCardWidth = this.cardGenerator.cardWidth() * this.cardResizer;
                var actualCardHeight = this.cardGenerator.cardHeight() * this.cardResizer;
                 var y = this.groupArea.baseRowCenterY; //this.groupArea.centerY + actualCardHeight;
                var yDelta = this.groupArea.direction === 'normal' ? -actualCardHeight / 3 : actualCardHeight / 3;
                var baseX = this.groupArea.centerX - 2 * actualCardWidth;
                 for (var rowIndex = 0; rowIndex < this.cards.length; rowIndex++) {
                    var cardsOnRow = this.cards[rowIndex];
                      CARD:
                    for (var cardIndex = 0; cardIndex < cardsOnRow.length; cardIndex++) {
                        var card = cardsOnRow[cardIndex];
                        // card already played
                        if(card === null) {
                            continue CARD;
                        }
                        var x = (baseX + actualCardWidth * 0.6 + actualCardWidth * 0.5 * rowIndex) + actualCardWidth * 1.05 * cardIndex;
                        card.setLocation({ x: x, y: y });
                        card.draw({ resizer: this.cardResizer });
                     }
                    y = y + yDelta;
                }*/
            }
        }, {
            key: 'markHoverable',
            value: function markHoverable(position) {
                this.cards.map(function (row) {
                    row.map(function (card) {
                        card.wasHovering = false;
                    });
                });
                var hoverableCards = [];

                HOVERABLES: for (var rowIndex = 0; rowIndex < this.cards.length; rowIndex += 1) {
                    var nextRowIndex = rowIndex === this.cards.length - 1 ? null : rowIndex + 1;
                    var cardsOnThisRow = this.cards[rowIndex];
                    // if(nextRowIndex === null) {
                    //     hoverableCards = hoverableCards.concat(cardsOnThisRow);
                    //     break HOVERABLES;
                    // }
                    var cardsOnNextRow = this.cards[nextRowIndex];

                    for (var cardIndex = 0; cardIndex < cardsOnThisRow.length; cardIndex += 1) {
                        var cardStack = cardsOnThisRow[cardIndex];

                        var hoveredCard;
                        try {
                            console.log('in pyramid markHoverable', 'nri:', nextRowIndex, 'ri:', rowIndex, 'ci:', cardIndex, cardsOnNextRow[cardIndex - 1], cardsOnNextRow.length - 1, cardsOnNextRow[cardIndex]);
                        } catch (e) {}
                        if (nextRowIndex === null || cardIndex > 0 && !cardsOnNextRow[cardIndex - 1].cards.length || cardIndex <= cardsOnNextRow.length - 1 && !cardsOnNextRow[cardIndex].cards.length) {
                            console.log(' -> passed first test', rowIndex, cardIndex, cardsOnThisRow, this.cards);
                            //if(hoveredCard = cardStack.markHoverable(position)) {
                            if (hoveredCard = this.cards[rowIndex][cardIndex].markHoverable(position)) {
                                console.log(' --> passed second test');
                                hoveredCard.pyramidLocation = { rowIndex: rowIndex, cardIndex: cardIndex };
                                return hoveredCard;
                            }
                        }

                        //  if(cardIndex > 0 && cardsOnNextRow[cardIndex - 1] === null) {
                        //      hoverableCards.push(card);
                        //  }
                        //  if(cardIndex < cardsOnNextRow.length - 1 && cardsOnNextRow[cardIndex + 1] === null) {
                        //      hoverableCards.push(card);
                        //  }
                    }
                }
                return;
                //        var hoveredCard;
                //        console.log('pyramid all hoverables', hoverableCards);
                //        for (var i = hoverableCards.length - 1; i >= 0; i -= 1) {
                //            var cardStack = hoverableCards[i];
                //            console.log('Pyramid hover', cardStack);
                //            if(cardStack.markHoverable(position)) {
                //                console.log('sure is hovered!!!!!!!!!!!!!!!!!!!>>>>>>>>>>>>>>>>>>>>>>>>>');
                //            }
                //            //if(card.isHover(position)) {
                //            //    card.wasHovering = true;
                //            //    return card;
                //            //}
                //        }
            }
        }]);

        return Pyramid;
    })(_groupOfCards.GroupOfCards);

    exports.Pyramid = Pyramid;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMucHlyYW1pZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7UUFJYSxPQUFPO2tCQUFQLE9BQU87O0FBQ0wsaUJBREYsT0FBTyxHQUN3QztnQkFBNUMsTUFBTSx5REFBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTs7a0NBRDdDLE9BQU87O0FBRWYsdUNBRlEsT0FBTyw2Q0FFVCxNQUFNLEVBQUU7QUFDWCxnQkFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsZ0JBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ3RELGdCQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkIsbUJBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7O3FCQVBRLE9BQU87O21CQVFELDJCQUFHO0FBQ2Qsb0JBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUN4RSxvQkFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRTFFLG9CQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUN0QyxvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUNsRyxvQkFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQzs7QUFFekQscUJBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFB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WUFBWSxLQUFLLElBQUksSUFBSyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxBQUFDLElBQUssU0FBUyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEFBQUMsRUFBRTtBQUMvSyxtQ0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXRGLGdDQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0RSx1Q0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3ZDLDJDQUFXLENBQUMsZUFBZSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDM0UsdUNBQU8sV0FBVyxDQUFDOzZCQUN0Qjt5QkFDSjs7Ozs7Ozs7cUJBUUo7aUJBQ0o7QUFDRCx1QkFBTzs7Ozs7Ozs7Ozs7Ozs7YUFjVjs7O2VBNUpRLE9BQU87cUJBRlgsWUFBWSIsImZpbGUiOiJnc3JjL2xpYi9taXNjL2dyb3VwLW9mLWNhcmRzLnB5cmFtaWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYXJkIH0gZnJvbSAnLi9jYXJkJztcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSAnLi9ncm91cC1vZi1jYXJkcy5zdGFjayc7XG5pbXBvcnQgeyBHcm91cE9mQ2FyZHMgfSBmcm9tICcuL2dyb3VwLW9mLWNhcmRzJztcblxuZXhwb3J0IGNsYXNzIFB5cmFtaWQgZXh0ZW5kcyBHcm91cE9mQ2FyZHMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHsgZ3JvdXBBcmVhOiB7fSwgZHJhd1BhcmFtczoge30gfSkge1xuICAgIFx0c3VwZXIocGFyYW1zKTtcbiAgICAgICAgdGhpcy5jYXJkcyA9IFtdO1xuICAgICAgICB0aGlzLmdyb3VwQXJlYS5kaXJlY3Rpb24gPSBwYXJhbXMuZ3JvdXBBcmVhLmRpcmVjdGlvbjsgLy8gbm9ybWFsIC8gaW52ZXJ0ZWRcbiAgICAgICAgdGhpcy5zZXR1cENhcmRTdGFja3MoKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgfVxuICAgIHNldHVwQ2FyZFN0YWNrcygpIHtcbiAgICAgICAgdmFyIGFjdHVhbENhcmRXaWR0aCA9IHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkV2lkdGgoKSAqIHRoaXMuY2FyZFJlc2l6ZXI7XG4gICAgICAgIHZhciBhY3R1YWxDYXJkSGVpZ2h0ID0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKSAqIHRoaXMuY2FyZFJlc2l6ZXI7XG5cbiAgICAgICAgdmFyIHkgPSB0aGlzLmdyb3VwQXJlYS5iYXNlUm93Q2VudGVyWTsgLy90aGlzLmdyb3VwQXJlYS5jZW50ZXJZICsgYWN0dWFsQ2FyZEhlaWdodDtcbiAgICAgICAgdmFyIHlEZWx0YSA9IHRoaXMuZ3JvdXBBcmVhLmRpcmVjdGlvbiA9PT0gJ25vcm1hbCcgPyAtYWN0dWFsQ2FyZEhlaWdodCAvIDMgOiBhY3R1YWxDYXJkSGVpZ2h0IC8gMztcbiAgICAgICAgdmFyIGJhc2VYID0gdGhpcy5ncm91cEFyZWEuY2VudGVyWCAtIDIgKiBhY3R1YWxDYXJkV2lkdGg7XG5cbiAgICAgICAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8PSA0OyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB0aGlzLmNhcmRzW3Jvd0luZGV4XSA9IFtdO1xuXG4gICAgICAgICAgICBDQVJEOlxuICAgICAgICAgICAgZm9yICh2YXIgY2FyZEluZGV4ID0gMDsgY2FyZEluZGV4IDwgKDUgLSByb3dJbmRleCk7IGNhcmRJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSAoYmFzZVggKyBhY3R1YWxDYXJkV2lkdGggKiAwLjYgKyBhY3R1YWxDYXJkV2lkdGggKiAwLjUgKiByb3dJbmRleCkgKyBhY3R1YWxDYXJkV2lkdGggKiAxLjA1ICogY2FyZEluZGV4O1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZHNbcm93SW5kZXhdW2NhcmRJbmRleF0gPSBuZXcgU3RhY2soe1xuICAgICAgICAgICAgICAgICAgICBzY2VuZTogdGhpcy5zY2VuZSxcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdlbmVyYXRvcjogdGhpcy5jYXJkR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgICAgICBncm91cEFyZWE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclg6IHgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJZOiB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6IDIwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodDogYWN0dWFsQ2FyZEhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZHJhd1BhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VSb3RhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uRnV6enluZXNzOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyRnV6enluZXNzOiAwLjAzLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeSA9IHkgKyB5RGVsdGE7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmVjYWxjdWxhdGVDYXJkUmVzaXplcigpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkSGVpZ2h0ID0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKTtcbiAgICAgICAgdmFyIGRlZmF1bHRDYXJkV2lkdGggPSB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZFdpZHRoKCk7XG5cbiAgICAgICAgdmFyIHJlc2l6ZVRvRml0SGVpZ2h0ID0gdGhpcy5ncm91cEFyZWEubWF4SGVpZ2h0IC8gZGVmYXVsdENhcmRIZWlnaHQgLyAyLjI7XG4gICAgICAgIHZhciByZXNpemVUb0ZpdFdpZHRoID0gdGhpcy5ncm91cEFyZWEubWF4V2lkdGggLyAodGhpcy5udW1iZXJPZkNhcmRzKCkgKyAxKSAvIGRlZmF1bHRDYXJkV2lkdGggKiAyOyAvLyAyLCBiZWNhdXNlIHRoZSBjYXJkcyBvdmVybGFwXG5cbiAgICAgICAgdGhpcy5jYXJkUmVzaXplciA9IHJlc2l6ZVRvRml0V2lkdGggPCByZXNpemVUb0ZpdEhlaWdodCA/IHJlc2l6ZVRvRml0V2lkdGggOiByZXNpemVUb0ZpdEhlaWdodDtcbiAgICB9XG4gICAgLy8gcm93IDEgaGFzIGZpdmUgY2FyZHMsIHJvdyA1IGhhcyBvbmUuXG4gICAgYWRkQ2FyZChyb3csIHBsYWNlLCBzdWl0LCB2YWx1ZSkge1xuICAgICAgICBpZihzdWl0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2FyZHNbcm93XVtwbGFjZV0uYWRkQ2FyZChzdWl0LCB2YWx1ZSk7XG4gICAgICAgICAgICAvL3RoaXMuY2FyZHNbcm93XVtwbGFjZV0ucHVzaChuZXcgQ2FyZCh7XG4gICAgICAgICAgICAvLyAgICBzdWl0OiBzdWl0LFxuICAgICAgICAgICAgLy8gICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgLy8gICAgaW1hZ2U6IHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkKHN1aXQsIHZhbHVlKSxcbiAgICAgICAgICAgIC8vICAgIGRyYXdQYXJhbXM6IHRoaXMuZHJhd1BhcmFtcyxcbiAgICAgICAgICAgIC8vICAgIHNjZW5lOiB0aGlzLnNjZW5lLFxuICAgICAgICAgICAgLy99KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUNhcmRSZXNpemVyKCk7XG4gICAgfVxuICAgIGRyYXcoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYXJkcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgdmFyIHJvdyA9IHRoaXMuY2FyZHNbaV07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcmRTdGFjayA9IHJvd1tqXTtcbiAgICAgICAgICAgICAgICBjYXJkU3RhY2suZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qdmFyIGFjdHVhbENhcmRXaWR0aCA9IHRoaXMuY2FyZEdlbmVyYXRvci5jYXJkV2lkdGgoKSAqIHRoaXMuY2FyZFJlc2l6ZXI7XG4gICAgICAgIHZhciBhY3R1YWxDYXJkSGVpZ2h0ID0gdGhpcy5jYXJkR2VuZXJhdG9yLmNhcmRIZWlnaHQoKSAqIHRoaXMuY2FyZFJlc2l6ZXI7XG5cbiAgICAgICAgdmFyIHkgPSB0aGlzLmdyb3VwQXJlYS5iYXNlUm93Q2VudGVyWTsgLy90aGlzLmdyb3VwQXJlYS5jZW50ZXJZICsgYWN0dWFsQ2FyZEhlaWdodDtcbiAgICAgICAgdmFyIHlEZWx0YSA9IHRoaXMuZ3JvdXBBcmVhLmRpcmVjdGlvbiA9PT0gJ25vcm1hbCcgPyAtYWN0dWFsQ2FyZEhlaWdodCAvIDMgOiBhY3R1YWxDYXJkSGVpZ2h0IC8gMztcbiAgICAgICAgdmFyIGJhc2VYID0gdGhpcy5ncm91cEFyZWEuY2VudGVyWCAtIDIgKiBhY3R1YWxDYXJkV2lkdGg7XG5cbiAgICAgICAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IHRoaXMuY2FyZHMubGVuZ3RoOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY2FyZHNPblJvdyA9IHRoaXMuY2FyZHNbcm93SW5kZXhdO1xuXG5cbiAgICAgICAgICAgIENBUkQ6XG4gICAgICAgICAgICBmb3IgKHZhciBjYXJkSW5kZXggPSAwOyBjYXJkSW5kZXggPCBjYXJkc09uUm93Lmxlbmd0aDsgY2FyZEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGNhcmRzT25Sb3dbY2FyZEluZGV4XTtcbiAgICAgICAgICAgICAgICAvLyBjYXJkIGFscmVhZHkgcGxheWVkXG4gICAgICAgICAgICAgICAgaWYoY2FyZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBDQVJEO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgeCA9IChiYXNlWCArIGFjdHVhbENhcmRXaWR0aCAqIDAuNiArIGFjdHVhbENhcmRXaWR0aCAqIDAuNSAqIHJvd0luZGV4KSArIGFjdHVhbENhcmRXaWR0aCAqIDEuMDUgKiBjYXJkSW5kZXg7XG4gICAgICAgICAgICAgICAgY2FyZC5zZXRMb2NhdGlvbih7IHg6IHgsIHk6IHkgfSk7XG4gICAgICAgICAgICAgICAgY2FyZC5kcmF3KHsgcmVzaXplcjogdGhpcy5jYXJkUmVzaXplciB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeSA9IHkgKyB5RGVsdGE7XG4gICAgICAgIH0qL1xuICAgIH1cbiAgICBtYXJrSG92ZXJhYmxlKHBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FyZHMubWFwKChyb3cpID0+IHsgcm93Lm1hcCgoY2FyZCkgPT4geyBjYXJkLndhc0hvdmVyaW5nID0gZmFsc2UgfSkgfSApO1xuICAgICAgICB2YXIgaG92ZXJhYmxlQ2FyZHMgPSBbXTtcblxuICAgICAgICBIT1ZFUkFCTEVTOlxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgdGhpcy5jYXJkcy5sZW5ndGg7IHJvd0luZGV4ICs9IDEpIHtcbiAgICAgICAgICAgIHZhciBuZXh0Um93SW5kZXggPSByb3dJbmRleCA9PT0gdGhpcy5jYXJkcy5sZW5ndGggLSAxID8gbnVsbCA6IHJvd0luZGV4ICsgMTtcbiAgICAgICAgICAgIHZhciBjYXJkc09uVGhpc1JvdyA9IHRoaXMuY2FyZHNbcm93SW5kZXhdO1xuICAgICAgICAgICAvLyBpZihuZXh0Um93SW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgLy8gICAgIGhvdmVyYWJsZUNhcmRzID0gaG92ZXJhYmxlQ2FyZHMuY29uY2F0KGNhcmRzT25UaGlzUm93KTtcbiAgICAgICAgICAgLy8gICAgIGJyZWFrIEhPVkVSQUJMRVM7XG4gICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHZhciBjYXJkc09uTmV4dFJvdyA9IHRoaXMuY2FyZHNbbmV4dFJvd0luZGV4XTtcblxuICAgICAgICAgICAgZm9yICh2YXIgY2FyZEluZGV4ID0gMDsgY2FyZEluZGV4IDwgY2FyZHNPblRoaXNSb3cubGVuZ3RoOyBjYXJkSW5kZXggKz0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBjYXJkU3RhY2sgPSBjYXJkc09uVGhpc1Jvd1tjYXJkSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGhvdmVyZWRDYXJkO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbiBweXJhbWlkIG1hcmtIb3ZlcmFibGUnLCAnbnJpOicsIG5leHRSb3dJbmRleCwgJ3JpOicsIHJvd0luZGV4LCAnY2k6JywgY2FyZEluZGV4LCBjYXJkc09uTmV4dFJvd1tjYXJkSW5kZXggLSAxXSwgY2FyZHNPbk5leHRSb3cubGVuZ3RoIC0gMSwgY2FyZHNPbk5leHRSb3dbY2FyZEluZGV4XSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICBpZihuZXh0Um93SW5kZXggPT09IG51bGwgfHwgKGNhcmRJbmRleCA+IDAgJiYgIWNhcmRzT25OZXh0Um93W2NhcmRJbmRleCAtIDFdLmNhcmRzLmxlbmd0aCkgfHwgKGNhcmRJbmRleCA8PSBjYXJkc09uTmV4dFJvdy5sZW5ndGggLSAxICYmICFjYXJkc09uTmV4dFJvd1tjYXJkSW5kZXhdLmNhcmRzLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyAtPiBwYXNzZWQgZmlyc3QgdGVzdCcsIHJvd0luZGV4LCBjYXJkSW5kZXgsIGNhcmRzT25UaGlzUm93LCB0aGlzLmNhcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZihob3ZlcmVkQ2FyZCA9IGNhcmRTdGFjay5tYXJrSG92ZXJhYmxlKHBvc2l0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBpZihob3ZlcmVkQ2FyZCA9IHRoaXMuY2FyZHNbcm93SW5kZXhdW2NhcmRJbmRleF0ubWFya0hvdmVyYWJsZShwb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgLS0+IHBhc3NlZCBzZWNvbmQgdGVzdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXJlZENhcmQucHlyYW1pZExvY2F0aW9uID0geyByb3dJbmRleDogcm93SW5kZXgsIGNhcmRJbmRleDogY2FyZEluZGV4IH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaG92ZXJlZENhcmQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vICBpZihjYXJkSW5kZXggPiAwICYmIGNhcmRzT25OZXh0Um93W2NhcmRJbmRleCAtIDFdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIC8vICAgICAgaG92ZXJhYmxlQ2FyZHMucHVzaChjYXJkKTtcbiAgICAgICAgICAgICAgLy8gIH1cbiAgICAgICAgICAgICAgLy8gIGlmKGNhcmRJbmRleCA8IGNhcmRzT25OZXh0Um93Lmxlbmd0aCAtIDEgJiYgY2FyZHNPbk5leHRSb3dbY2FyZEluZGV4ICsgMV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gICAgICBob3ZlcmFibGVDYXJkcy5wdXNoKGNhcmQpO1xuICAgICAgICAgICAgICAvLyAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbi8vICAgICAgICB2YXIgaG92ZXJlZENhcmQ7XG4vLyAgICAgICAgY29uc29sZS5sb2coJ3B5cmFtaWQgYWxsIGhvdmVyYWJsZXMnLCBob3ZlcmFibGVDYXJkcyk7XG4vLyAgICAgICAgZm9yICh2YXIgaSA9IGhvdmVyYWJsZUNhcmRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSAtPSAxKSB7XG4vLyAgICAgICAgICAgIHZhciBjYXJkU3RhY2sgPSBob3ZlcmFibGVDYXJkc1tpXTtcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coJ1B5cmFtaWQgaG92ZXInLCBjYXJkU3RhY2spO1xuLy8gICAgICAgICAgICBpZihjYXJkU3RhY2subWFya0hvdmVyYWJsZShwb3NpdGlvbikpIHtcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdXJlIGlzIGhvdmVyZWQhISEhISEhISEhISEhISEhISEhPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PicpO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIC8vaWYoY2FyZC5pc0hvdmVyKHBvc2l0aW9uKSkge1xuLy8gICAgICAgICAgICAvLyAgICBjYXJkLndhc0hvdmVyaW5nID0gdHJ1ZTtcbi8vICAgICAgICAgICAgLy8gICAgcmV0dXJuIGNhcmQ7XG4vLyAgICAgICAgICAgIC8vfVxuLy8gICAgICAgIH1cbiAgICB9XG59XG4iXX0=;
define('components/finne/finne',['exports', 'module', 'knockout', 'text!./finne.html', './communicator', '../../lib/misc/chat', '../../lib/misc/transform', '../../lib/misc/scene', '../../lib/misc/card', '../../lib/misc/card-generator', '../../lib/misc/group-of-cards.hand', '../../lib/misc/group-of-cards.stack', '../../lib/misc/group-of-cards.pyramid', '../../lib/misc/utilities'], function (exports, module, _knockout, _textFinneHtml, _communicator, _libMiscChat, _libMiscTransform, _libMiscScene, _libMiscCard, _libMiscCardGenerator, _libMiscGroupOfCardsHand, _libMiscGroupOfCardsStack, _libMiscGroupOfCardsPyramid, _libMiscUtilities) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _templateMarkup = _interopRequireDefault(_textFinneHtml);

    var _copyArray = _interopRequireDefault(_libMiscUtilities);

    _ko['default'].bindingHandlers.modalVisible = {
        init: function init(element) {
            $(element).modal({
                /*      backdrop: 'static',*/
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

            var $gameArea = $('#finne-page canvas');
            this.canvas = $gameArea[0];
            this.canvas.width = window.innerWidth - 200;
            this.canvas.height = window.innerHeight;
            $('#finne-page').css('background-size', 'auto ' + this.canvas.width + 'px');

            this.ctx = this.canvas.getContext('2d');

            var possibleName = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 5; i++) {
                possibleName += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            this.possibleName = _ko['default'].observable(possibleName);

            this.scene = new _libMiscScene.Scene({ canvas: this.canvas });

            this.chat = new _libMiscChat.Chat({ scrollFollow: '#chat-log' });
            this.chatMessage = _ko['default'].observable();

            this.cardGenerator = new _libMiscCardGenerator.CardGenerator({ scene: this.scene });

            this.gameCode = _ko['default'].observable();
            this.gameIsInProgress = _ko['default'].observable(false);
            this.server = new _communicator.Communicator({
                chat: this.chat,
                handleIncoming: function handleIncoming(message) {
                    return _this.incoming(message);
                }
            });
            this.cardGroups = {};
            this.playerSignature;
            this.hoveredCard = {};
            this.allowedPlays = {};
            this.popupCardChoices = _ko['default'].observableArray([]);
            this.popupCardDestinations = _ko['default'].observableArray([]);

            this.cardGenerator.loadCards().then(function () {
                _this.setupCardGroups();
                _this.setupEventListeners();
                // this.showShuffling()
            });

            //  cardsLoadedPromise.then((result) => {

            //     this.showShuffling();
            //     this.setupCardGroups();
            /*
                 console.log(this.opponentHand);
                 this.canvas.addEventListener('resize', (e) => {
                    console.log('resize fired', e);
                    this.canvas.width = window.innerWidth - 300;
                    this.canvas.height = window.innerHeight;
                });
                 this.canvas.addEventListener('mousemove', (e) => {
                    var position = this.getCursorLocation(e);
                    this.cardGroups.myHand.markHoverable(position);
                    this.cardGroups.stack.markHoverable(position);
                    this.cardGroups.pile.markHoverable(position);
                    this.cardGroups.myPyramid.markHoverable(position);
                    
                    this.drawCardGroups();
                });
                this.canvas.addEventListener('click', (e) => {
                    var pilePosition = this.cardGroups.pile.newCardPosition();
                    if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                        console.log('pileposition', pilePosition);
                            card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                    })) {
                        this.drawCardGroups();
                         if(this.cardGroups.pile.cards.map((card) => {
                            card.hasMove()
                        }).length) {
                            requestAnimationFrame(() => this.aCardIsMoving());
                        }
                    }
                })
                 
                this.animateACard();
                this.start();*/
            // });
        }

        _createClass(Finne, [{
            key: 'setupEventListeners',
            value: function setupEventListeners() {
                var _this2 = this;

                this.canvas.addEventListener('mousemove', function (e) {
                    var position = _this2.getCursorLocation(e);
                    var hoveredCard;

                    if (hoveredCard = _this2.cardGroups.pile.markHoverable(position)) {
                        _this2.hoveredCard.card = hoveredCard;
                        _this2.hoveredCard.origin = 'pile';
                    } else if (hoveredCard = _this2.cardGroups.myHand.markHoverable(position)) {
                        _this2.hoveredCard.card = hoveredCard;
                        _this2.hoveredCard.origin = 'hand';
                    } else if (hoveredCard = _this2.cardGroups.stack.markHoverable(position)) {
                        console.log('hovercard stack', hoveredCard);
                        _this2.hoveredCard.card = hoveredCard;
                        _this2.hoveredCard.origin = 'stack';
                    } else if (!_this2.cardGroups.myHand.cards.length && !_this2.cardGroups.stack.cards.length && (hoveredCard = _this2.cardGroups.myPyramid.markHoverable(position))) {

                        console.log('hovercard pyramid', hoveredCard, _this2.allowedPlays);

                        _this2.hoveredCard.card = hoveredCard;
                        _this2.hoveredCard.origin = 'pyramid';
                        _this2.hoveredCard.pyramidLocation = hoveredCard.pyramidLocation;
                    } else {
                        _this2.hoveredCard = {};
                    }
                    console.log('after hover', _this2.allowedPlays, _this2.cardGroups.myPyramid);
                    _this2.drawCardGroups();
                });

                this.canvas.addEventListener('click', function (e) {
                    _this2.attemptMakePlay();
                });
            }
        }, {
            key: 'attemptMakePlay',
            value: function attemptMakePlay() {
                var _this3 = this;

                // no card hovered
                if (!this.hoveredCard.card) {
                    return;
                }
                // Remove earlier plays information from chat
                //    this.chat.chatMessages(this.chat.chatMessages().filter((chatMessage) => {
                //        return chatMessage.className !== 'chat-status-server-play';
                //    }));

                var hoveredCard = this.hoveredCard.card;
                if (this.hoveredCard.origin === 'pile') {
                    if (!this.allowedPlays.pile) {
                        return;
                    }
                    this.server.makePlay({
                        signature: this.playerSignature,
                        cards: this.cardGroups.pile.cards,
                        origin: 'pile',
                        destination: 'hand'
                    });
                } else if (this.allowedPlays.pile) {
                    this.chat.put({ from: 'server', text: 'You must pick up the pile', status: 'play' });
                } else if (this.hoveredCard.origin === 'hand') {

                    // nothing allowed
                    if (!this.allowedPlays.hand.length) {
                        return;
                    }

                    var cardsOnHand = this.cardGroups.myHand.cards.filter(function (card) {
                        return card.suit === hoveredCard.suit && card.value === hoveredCard.value;
                    });
                    if (cardsOnHand.length === 1) {
                        (function () {
                            var cardOnHand = cardsOnHand[0];
                            var allowedPlay = _this3.allowedPlays.hand.filter(function (play) {
                                return cardOnHand.suit === play.suit, cardOnHand.value === play.value;
                            })[0];

                            if (allowedPlay.to) {

                                var cardsWithSameValue = _this3.cardGroups.myHand.cards.filter(function (card) {
                                    return card.value === cardOnHand.value;
                                });
                                console.log('cards, same value', cardsWithSameValue);
                                if (cardsWithSameValue.length > 1 || allowedPlay.to.length > 1) {
                                    console.log('sets otherCardsWithSameValue');
                                    _this3.popupCardChoices(cardsWithSameValue);
                                    _this3.popupCardDestinations(allowedPlay.to.map(function (thisTo) {
                                        return { to: thisTo };
                                    }));
                                } else if (allowedPlay.to.length === 1) {
                                    _this3.server.makePlay({
                                        signature: _this3.playerSignature,
                                        cards: [cardOnHand],
                                        origin: 'hand',
                                        destination: allowedPlay.to[0]
                                    });
                                }
                            } else {
                                _this3.chat.put({ from: 'server', text: 'Cant make that move', status: 'warnings' });
                            }
                        })();
                    }
                } else if (this.hoveredCard.origin === 'stack' && this.allowedPlays.stack) {
                    console.log('allowed plays', this.allowedPlays);
                    this.server.makePlay({
                        signature: this.playerSignature,
                        origin: 'stack',
                        destination: 'pile'
                    });
                } else if (this.hoveredCard.origin === 'pyramid') {
                    console.log('attemptMakePlay', this.hoveredCard, this.allowedPlays);
                    var hoveredRowIndex = this.hoveredCard.pyramidLocation.rowIndex;
                    var hoveredCardIndex = this.hoveredCard.pyramidLocation.cardIndex;

                    var allowedPlay;
                    if (allowedPlay = this.allowedPlays.pyramid[hoveredRowIndex][hoveredCardIndex]) {
                        if (allowedPlay.to.length === 1) {
                            this.server.makePlay({
                                signature: this.playerSignature,
                                pyramidLocation: { rowIndex: hoveredRowIndex, cardIndex: hoveredCardIndex },
                                origin: 'pyramid',
                                destination: allowedPlay.to[0]
                            });
                        }
                    }
                }
            }
        }, {
            key: 'popupMakeMove',
            value: function popupMakeMove() {
                console.log('made popup move', this.hoveredCard);
                console.log($('.card-choices'), $('.card-destination'));
                var origin = this.hoveredCard.origin;
                var cardValue = this.hoveredCard.card.value;

                var playTo;
                $('.card-destination').each(function (i, el) {
                    var $el = $(el);
                    if ($el.prop('checked')) {
                        playTo = $el.val();
                    }
                });
                if (!playTo) {
                    this.chat.put({ from: 'server', text: "Destination not chosen, can't play", status: 'play' });
                    return;
                }

                var cardsToPlay = [];
                $('.card-choices').each(function (i, el) {
                    var $el = $(el);
                    console.log('el', $el);
                    console.log('val', $el.val());
                    if ($el.prop('checked')) {
                        cardsToPlay.push({ value: cardValue, suit: $el.val(), to: playTo });
                    }
                });
                this.popupCardChoices([]);
                this.popupCardDestinations([]);

                if (!cardsToPlay.length) {
                    return;
                }

                var allowedPlay = this.allowedPlays.hand.filter(function (play) {
                    return cardsToPlay[0].suit === play.suit && cardsToPlay[0].value === play.value && play.to.indexOf(cardsToPlay[0].to) >= 0;
                })[0];

                if (allowedPlay) {

                    this.server.makePlay({
                        signature: this.playerSignature,
                        cards: cardsToPlay,
                        origin: 'hand',
                        destination: cardsToPlay[0].to
                    });
                }

                console.log($('.card-choice-value'), $('.card-choice-value').first().val());
                console.log('end popup move');
            }

            //            if(this.hoveredCard.card) {
            //                this.server.makePlay({
            //                    signature: this.playerSignature,
            //                    card: this.hoveredCard.card,
            //                    origin: this.hoveredCard.origin,
            //                })
            //                .then((value) => {
            //
            //                },
            //                (reason) => {
            //                   
            //                });
            //            }
            //            var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
            //            if(success) {
            //                this.chat.put({ from: 'server', text: 'Connected to server' });
            //            }
            //            else {
            //                this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.'});
            //            }

            /*
            
                        this.canvas.addEventListener('click', (e) => {
                            var pilePosition = this.cardGroups.pile.newCardPosition();
                            if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                                console.log('pileposition', pilePosition);
                                    card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                            })) {
                                this.drawCardGroups();
            
                                if(this.cardGroups.pile.cards.map((card) => {
                                    card.hasMove()
                                }).length) {
                                    requestAnimationFrame(() => this.aCardIsMoving());
                                }
                            }
                        })
            
            */

            // TODO: Remove this in production...
        }, {
            key: 'clearAllGames',
            value: function clearAllGames() {
                this.server.sendCommand('reset_games');
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
            key: 'newGame',
            value: function newGame(form) {
                var playerName = $('#name').val();
                this.gameCode($('#gamecode').val());

                var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
                if (success) {
                    this.chat.put({ from: 'server', text: 'Connected to server' });
                } else {
                    this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.' });
                }
            }
        }, {
            key: 'showShuffling',
            value: function showShuffling() {
                var _this4 = this;

                var showShuffler = new _libMiscGroupOfCardsStack.Stack({
                    scene: this.scene,
                    cardGenerator: this.cardGenerator,
                    groupArea: {
                        centerY: this.canvas.height * 0.25,
                        centerX: this.canvas.width * 0.45,
                        maxWidth: this.canvas.width * .2,
                        maxHeight: this.canvas.height * 0.2
                    },
                    drawParams: {
                        width: 400,
                        rotationFuzzyness: 180,
                        centerFuzzyness: 4
                    }
                });
                for (var i = 1; i <= 52; i += 1) {
                    showShuffler.addCard('back', 'red');
                }

                requestAnimationFrame(function () {
                    _this4.showShufflingAnimated(showShuffler);
                });
            }
        }, {
            key: 'showShufflingAnimated',
            value: function showShufflingAnimated(showShuffler) {
                var _this5 = this;

                if (!showShuffler.cards.length) {
                    return;
                }

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                showShuffler.cards.pop();
                this.cardGroups.stack.addCard('back', 'red');
                showShuffler.rerandomizeAllCards();
                this.cardGroups.stack.draw();
                showShuffler.draw();
                requestAnimationFrame(function () {
                    _this5.showShufflingAnimated(showShuffler);
                });
            }
        }, {
            key: 'incomingInitGame',
            value: function incomingInitGame(message) {
                this.gameIsInProgress(true);
                this.playerSignature = message.player.signature;
                this.allowedPlays = message.allowed_plays;
                console.log('set allowed plays', this.allowedPlays);
                console.log(message.player, message.player.cards, message.stack);
                if (message.is_starting_player) {
                    this.chat.put({ from: 'server', text: "It's your turn", status: 'info' });
                } else {
                    this.chat.put({ from: 'server', text: "Waiting for opponent", status: 'info' });
                }
                this.dealCards(message).then(function () {
                    console.log('dealt cards');
                });
            }
        }, {
            key: 'incoming',
            value: function incoming(message) {
                if (message.command === 'init_game') {
                    this.incomingInitGame(message);
                } else if (message.command === 'chat') {
                    this.chat.put({ from: message.from || 'other', text: message.message, status: message.status });
                } else if (message.command === 'move_card') {
                    this.incomingMoveCard(message);
                }
            }
        }, {
            key: 'incomingMoveCard',
            value: function incomingMoveCard(message) {
                var _this6 = this;

                var from = message.from;
                var to = message.to;

                var cards = message.cards;
                console.log('incoming move card', message, cards);

                for (var i = 0; i < cards.length; i += 1) {
                    var suit = cards[i].suit;
                    var value = cards[i].value;

                    if (from === 'hand' && to === 'pile') {
                        this.cardGroups.myHand.moveCardOnto(suit, value, this.cardGroups.pile, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.pile.newCardPosition() });
                        });
                    } else if (from === 'opponents_hand' && to === 'pile') {
                        this.cardGroups.opponentsHand.replacePrivateCard([{ suit: suit, value: value }]);
                        this.cardGroups.opponentsHand.moveCardOnto(suit, value, this.cardGroups.pile, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.pile.newCardPosition() });
                        });
                    } else if (from === 'stack' && to === 'hand') {
                        this.cardGroups.stack.replacePrivateCard([{ suit: suit, value: value }]);
                        this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.myHand, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.myHand.newCardPosition() });
                        });
                    } else if (from === 'stack' && to === 'opponents_hand') {
                        this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.opponentsHand, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.opponentsHand.newCardPosition() });
                        });
                    } else if (from === 'stack' && to === 'pile') {
                        console.log('moving from stack to pile', suit, value);

                        this.cardGroups.stack.replacePrivateCard([{ suit: suit, value: value }]);
                        this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.pile, function (card) {
                            card.setMove({ steps: 10, rotation: 0, toPosition: _this6.cardGroups.pile.newCardPosition() });
                        });
                    } else if (from === 'pile' && to === 'hand') {
                        console.log('moving from pile to hand', suit, value);
                        this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.myHand, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.myHand.newCardPosition() });
                        });
                    } else if (from === 'pile' && to === 'opponents_hand') {
                        console.log('moving from pile to opponents hand', suit, value);
                        this.cardGroups.pile.replaceAllPublicCards(value);
                        this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.opponentsHand, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.opponentsHand.newCardPosition() });
                        });
                    } else if (from === 'pile' && to === 'discarded') {
                        console.log('moving from pile to discarded', suit, value);
                        this.cardGroups.pile.replaceAllPublicCards(value);
                        this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.discarded, function (card) {
                            card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.discarded.newCardPosition() });
                        });
                    } else if (from === 'pyramid') {
                        console.log('moving from pyramid to hand', message);
                        var rowIndex = message.pyramid_location.row_index;
                        var cardIndex = message.pyramid_location.card_index;

                        var cardStack = this.cardGroups.myPyramid.cards[rowIndex][cardIndex];

                        if (cardStack.cards[0].suit === 'back') {
                            cardStack.replacePrivateCard(message.cards);
                        }

                        if (to === 'hand') {
                            cardStack.moveCardOnto(suit, value, this.cardGroups.myHand, function (card) {
                                card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.myHand.newCardPosition() });
                            });
                        } else if (to === 'pile') {
                            cardStack.moveCardOnto(suit, value, this.cardGroups.pile, function (card) {
                                card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.pile.newCardPosition() });
                            });
                        }
                    } else if (from === 'opponents_pyramid') {
                        console.log('moving from opponents_pyramid to opponents_hand', message);
                        var rowIndex = message.pyramid_location.row_index;
                        var cardIndex = message.pyramid_location.card_index;

                        var cardStack = this.cardGroups.opponentsPyramid.cards[rowIndex][cardIndex];

                        if (to === 'opponents_hand') {
                            cardStack.moveCardOnto(suit, value, this.cardGroups.opponentsHand, function (card) {
                                card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.opponentsHand.newCardPosition() });
                            });
                        } else if (to === 'pile') {
                            cardStack.moveCardOnto(suit, value, this.cardGroups.pile, function (card) {
                                card.setMove({ steps: 20, rotations: 3, toPosition: _this6.cardGroups.pile.newCardPosition() });
                            });
                        }
                    }
                }

                if (this.cardGroups.pile.cards.map(function (card) {
                    card.hasMove();
                }).length) {
                    requestAnimationFrame(function () {
                        return _this6.aCardIsMoving();
                    });
                } else if (this.cardGroups.stack.cards.map(function (card) {
                    card.hasMove();
                }).length) {
                    requestAnimationFrame(function () {
                        return _this6.aCardIsMoving();
                    });
                } else if (this.cardGroups.discarded.cards.map(function (card) {
                    card.hasMove();
                }).length) {
                    requestAnimationFrame(function () {
                        return _this6.aCardIsMoving();
                    });
                } else if (this.cardGroups.myHand.cards.map(function (card) {
                    card.hasMove();
                }).length) {
                    requestAnimationFrame(function () {
                        return _this6.aCardIsMoving();
                    });
                } else if (this.cardGroups.opponentsHand.cards.map(function (card) {
                    card.hasMove();
                }).length) {
                    requestAnimationFrame(function () {
                        return _this6.aCardIsMoving();
                    });
                }

                this.allowedPlays = message.allowed_plays;
            }

            /*
            command: "move_card"
            from: "hand"
            hand: Object
            cards: Array[2]
            __proto__: Object
            suit: "hearts"
            to: "pile"
            value: "3"
            this.canvas.addEventListener('click', (e) => {
                        var pilePosition = this.cardGroups.pile.newCardPosition();
                        if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                            console.log('pileposition', pilePosition);
                                card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                        })) {
                            this.drawCardGroups();
                             if(this.cardGroups.pile.cards.map((card) => {
                                card.hasMove()
                            }).length) {
                                requestAnimationFrame(() => this.aCardIsMoving());
                            }
                        }
                    })
            */
        }, {
            key: 'dealCards',
            value: function dealCards(message) {
                var _this7 = this;

                message.stack.cards.map(function (cardData) {
                    _this7.cardGroups.stack.addCard(cardData.suit, cardData.value);
                });
                message.player.cards_on_hand.cards.map(function (cardData) {
                    _this7.cardGroups.myHand.addCard(cardData.suit, cardData.value);
                });
                message.opponent.cards_on_hand.cards.map(function (cardData) {
                    _this7.cardGroups.opponentsHand.addCard(cardData.suit, cardData.value);
                });

                var playerCardsOnTable = message.player.cards_on_table;
                var opponentCardsOnTable = message.opponent.cards_on_table;

                return new Promise(function (resolve, reject) {
                    for (var rowIndex = 0; rowIndex <= 4; rowIndex += 1) {
                        for (var cardIndex = 0; cardIndex <= 4 - rowIndex; cardIndex += 1) {
                            var myCard = playerCardsOnTable.cards[rowIndex][cardIndex].cards[0];
                            var opponentCard = opponentCardsOnTable.cards[rowIndex][cardIndex].cards[0];

                            _this7.cardGroups.myPyramid.addCard(rowIndex, cardIndex, myCard.suit, myCard.value);
                            _this7.cardGroups.opponentsPyramid.addCard(rowIndex, cardIndex, opponentCard.suit, opponentCard.value);
                            requestAnimationFrame(function () {
                                return _this7.drawCardGroups();
                            });
                        }
                    }

                    //   for (var i = 1; i <= 15; i += 1) {
                    //       this.cardGroups.stack.moveTopCardOnto(this.cardGroups.myPyramid, (card) => {
                    //            card.setMove({ steps: 20, rotations: 0, toPosition: this.cardGroups.myPyramid.newCardPosition() });
                    //       });
                    //   }
                }).then(function () {
                    return;
                });
            }
        }, {
            key: 'drawCardGroups',
            value: function drawCardGroups() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.cardGroups.myHand.sortBy('value');

                this.cardGroups.discarded.draw();
                this.cardGroups.myHand.draw();
                this.cardGroups.opponentsHand.draw();
                this.cardGroups.myPyramid.draw();
                this.cardGroups.opponentsPyramid.draw();
                this.cardGroups.stack.draw();
                this.cardGroups.pile.draw();
            }
        }, {
            key: 'aCardIsMoving',
            value: function aCardIsMoving() {
                var _this8 = this;

                this.drawCardGroups();
                var cardGroups = ['myHand', 'opponentsHand', 'stack', 'pile', 'discarded'];

                for (var i = 0; i < cardGroups.length; i += 1) {
                    var cardGroup = cardGroups[i];
                    if (this.cardGroups[cardGroup].cards.map(function (card) {
                        card.hasMove();
                    }).length) {
                        requestAnimationFrame(function () {
                            return _this8.aCardIsMoving();
                        });
                        break;
                    }
                }
            }
        }, {
            key: 'animateACard',
            value: function animateACard() {
                /*
                var card = new Card({
                    suit: 'clubs',
                    value: 'queen',
                    image: this.cardGenerator.card('clubs', 'queen'),
                    scene: this.scene,
                });
                this.cardGroups.myHand.ensureCard('clubs', 'queen');
                this.cardGroups.myHand.ensureCard('spades', 'king');
                this.cardGroups.myHand.ensureCard('diamonds', 'queen');
                this.cardGroups.myHand.ensureCard('spades', 'king');
                this.cardGroups.myHand.ensureCard('diamonds', '4');
                this.cardGroups.myHand.ensureCard('hearts', 'jack');
                 this.cardGroups.myHand.addCard('clubs', 'queen');
                this.cardGroups.myHand.addCard('spades', 'king');
                this.cardGroups.myHand.addCard('diamonds', 'queen');
                this.cardGroups.myHand.addCard('spades', 'king');
                this.cardGroups.myHand.addCard('diamonds', '4');
                this.cardGroups.myHand.addCard('hearts', 'jack');
                this.cardGroups.myHand.addCard('clubs', 'queen');
                this.cardGroups.myHand.addCard('spades', 'king');
                this.cardGroups.myHand.addCard('diamonds', 'queen');
                this.cardGroups.myHand.addCard('spades', 'king');
                this.cardGroups.myHand.addCard('diamonds', '4');
                this.cardGroups.myHand.addCard('hearts', 'jack');
                 this.cardGroups.opponentsHand.addCard('back', 'red');
                this.cardGroups.opponentsHand.addCard('back', 'red');
                this.cardGroups.opponentsHand.addCard('back', 'red');
                 for (var i = 0; i < 25; i++) {
                    this.cardGroups.stack.addCard('back', 'red');
                }
                for (var i = 0; i < 25; i++) {
                    this.cardGroups.discarded.addCard('back', 'red');
                }
                this.cardGroups.pile.ensureCard('clubs', 'queen');
                this.cardGroups.pile.ensureCard('spades', 'king');
                this.cardGroups.pile.ensureCard('diamonds', 'queen');
                this.cardGroups.pile.ensureCard('spades', 'king');
                this.cardGroups.pile.ensureCard('diamonds', '4');
                this.cardGroups.pile.ensureCard('hearts', 'jack');
                this.cardGroups.pile.ensureCard('diamonds', '8');
                 this.cardGroups.myPyramid.addCard(1, 'back', 'red');
                this.cardGroups.myPyramid.addCard(1, 'back', 'red');
                this.cardGroups.myPyramid.addCard(1, 'back', 'red');
                this.cardGroups.myPyramid.addCard(1, 'back', 'red');
                this.cardGroups.myPyramid.addCard(1, 'back', 'red');
                this.cardGroups.myPyramid.addCard(2, 'diamonds', 'queen');
                this.cardGroups.myPyramid.addCard(2, 'spades', 'king');
                this.cardGroups.myPyramid.addCard(2, 'diamonds', '4');
                this.cardGroups.myPyramid.addCard(2, 'hearts', 'jack');
                this.cardGroups.myPyramid.addCard(3, 'back', 'red');
                this.cardGroups.myPyramid.addCard(3, 'back', 'red');
                this.cardGroups.myPyramid.addCard(3, 'back', 'red');
                this.cardGroups.myPyramid.addCard(4, 'clubs', 'queen');
                this.cardGroups.myPyramid.addCard(4, 'hearts', 'ace');
                this.cardGroups.myPyramid.addCard(5, 'back', 'red');
                 this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(2, 'diamonds', 'queen');
                this.cardGroups.opponentsPyramid.addCard(2, 'spades', 'king');
                this.cardGroups.opponentsPyramid.addCard(2, 'diamonds', '4');
                this.cardGroups.opponentsPyramid.addCard(2, 'hearts', 'jack');
                this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
                this.cardGroups.opponentsPyramid.addCard(4, 'clubs', 'queen');
                this.cardGroups.opponentsPyramid.addCard(4, 'hearts', 'ace');
                this.cardGroups.opponentsPyramid.addCard(5, 'back', 'red');
                 card.draw({ x: 300, y: 500, resizer: 0.6 });
                return this.startAnimating(card, 300);
                */
            }
        }, {
            key: 'startAnimating',
            value: function startAnimating(card, x) {
                var _this9 = this;

                this.drawCardGroups();
                //     card.draw({ x: x, y: 500, resizer: 0.6, rotationFuzzyness: 0 });
                if (x > 650) {
                    return;
                }
                return requestAnimationFrame(function () {
                    return _this9.startAnimating(card, x + 5);
                });
            }
        }, {
            key: 'start',
            value: function start() {
                var _this10 = this;

                /*
                this.myHand.addCard('clubs', 'queen');
                this.myHand.addCard('spades', 'king');
                this.myHand.addCard('diamonds', 'queen');
                this.myHand.addCard('spades', 'king');
                this.myHand.addCard('diamonds', '4');
                this.myHand.addCard('hearts', 'jack');
                this.myHand.addCard('clubs', 'queen');
                this.myHand.addCard('spades', 'king');
                this.myHand.addCard('diamonds', 'queen');
                this.myHand.addCard('spades', 'king');
                this.myHand.addCard('diamonds', '4');
                this.myHand.addCard('hearts', 'jack');
                */
                this.drawCardGroups();
                this.cardGroups.myHand.sortBy('suit');
                //   setTimeout(() => { this.ctx.clearRect(0, 100, 2000, 1000); this.myHand.draw() }, 1500);

                var y = this.canvas.height - 50;
                this.areas.push(this.cards.card('clubs', 'queen').draw({ x: 400, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }));
                this.areas.push(this.cards.card('spades', 'king').draw({ x: 470, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }));
                this.areas.push(this.cards.card('diamonds', 'queen').draw({ x: 540, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }));
                this.areas.push(this.cards.card('spades', 'king').draw({ x: 610, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }));
                this.areas.push(this.cards.card('diamonds', '4').draw({ x: 680, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }));

                this.draggableIndex = null;
                this.draggedIndex = null;

                this.canvas.addEventListener('mousemove', function (e) {
                    var position = _this10.getCursorLocation(e);

                    if (_this10.draggedIndex !== null) {
                        var params = {
                            x: position.x,
                            y: position.y,
                            useActual: true
                        };

                        _this10.draw(_this10.draggedIndex);
                        _this10.areas[_this10.draggedIndex].redrawOutline(params);
                        _this10.areas[_this10.draggedIndex].redraw(params);
                    } else {
                        var found = false;

                        FINDCARD: for (var i = _this10.areas.length - 1; i >= 0; i--) {
                            if (_this10.areas[i].isHover(position)) {
                                e.target.style.cursor = 'pointer';
                                _this10.draggableIndex = i;
                                _this10.writeMessage('Over ' + _this10.areas[i].suit + ' ' + _this10.areas[i].value);
                                _this10.draw(i, function () {
                                    var area = _this10.areas[i];

                                    for (var j = 0; j <= 5; j++) {
                                        requestAnimationFrame(function () {
                                            area.redrawOutline({ y: area.drawParams.y - 20 * j, useActual: true });
                                            area.redraw({ y: area.drawParams.y - 20 * j, useActual: true });
                                        });
                                    }
                                });
                                found = true;
                                break FINDCARD;
                            }
                            e.target.style.cursor = 'default';
                        }
                        if (!found) {
                            _this10.draggableIndex = null;
                            for (var i = _this10.areas.length; i >= 0; i--) {
                                _this10.draw();
                                e.target.style.cursor = 'default';
                                _this10.writeMessage('...');
                            }
                        }
                    }
                });
                this.canvas.addEventListener('mousedown', function (e) {
                    var position = _this10.getCursorLocation(e);
                    console.log('mouse is down');
                    if (_this10.draggableIndex !== null) {
                        _this10.draggedIndex = _this10.draggableIndex;
                    }
                });
                this.canvas.addEventListener('mouseup', function (e) {
                    _this10.draw();
                    _this10.draggedIndex = null;
                });
            }
        }, {
            key: 'draw',
            value: function draw() {
                var hoveredIndex = arguments.length <= 0 || arguments[0] === undefined ? -100 : arguments[0];
                var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

                this.ctx.clearRect(0, 100, 2000, 1000);
                for (var i = 0; i < this.areas.length; i++) {
                    if (i === hoveredIndex) {
                        callback();
                    } else {
                        this.areas[i].redraw({ useActual: true });
                    }
                }
            }
        }, {
            key: 'getCursorLocation',
            value: function getCursorLocation(e) {
                var bounds = this.canvas.getBoundingClientRect();
                return {
                    x: e.clientX - bounds.left,
                    y: e.clientY - bounds.top
                };
            }
        }, {
            key: 'writeMessage',
            value: function writeMessage(message) {
                this.ctx.clearRect(0, 0, 500, 100);
                this.ctx.font = '18pt Calibri';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(message, 10, 55);
            }
        }, {
            key: 'setupCardGroups',
            value: function setupCardGroups() {
                this.setupCardGroupMyHand();
                this.setupMyPyramid();
                this.setupCardGroupOpponentsHand();
                this.setupOpponentsPyramid();
                this.setupCardGroupStack();
                this.setupCardGroupPile();
                this.setupCardGroupDiscarded();
            }

            // Hands
        }, {
            key: 'handCommonParams',
            value: function handCommonParams() {
                return {
                    scene: this.scene,
                    cardGenerator: this.cardGenerator,
                    groupArea: {
                        leftX: 20,
                        centerY: this.canvas.height * 0.95,
                        maxWidth: this.canvas.width / 3,
                        maxHeight: this.canvas.height / 3
                    },
                    drawParams: {
                        width: 400,
                        baseRotation: 0,
                        rotationFuzzyness: 3,
                        centerFuzzyness: 0.05
                    }
                };
            }
        }, {
            key: 'setupCardGroupMyHand',
            value: function setupCardGroupMyHand() {
                var params = this.handCommonParams();
                params.groupArea.centerY = this.canvas.height * 0.95, this.cardGroups.myHand = new _libMiscGroupOfCardsHand.Hand(params);
            }
        }, {
            key: 'setupCardGroupOpponentsHand',
            value: function setupCardGroupOpponentsHand() {
                var params = this.handCommonParams();
                params.groupArea.centerY = this.canvas.height * 0.05, this.cardGroups.opponentsHand = new _libMiscGroupOfCardsHand.Hand(params);
            }

            // Stacks
        }, {
            key: 'stackClassCommonParams',
            value: function stackClassCommonParams() {
                return {
                    scene: this.scene,
                    cardGenerator: this.cardGenerator,
                    groupArea: {

                        centerY: this.canvas.height / 2,
                        maxWidth: 200,
                        maxHeight: this.canvas.height / 4
                    },
                    drawParams: {
                        width: 350,
                        baseRotation: 0
                    }
                };
            }
        }, {
            key: 'setupCardGroupStack',
            value: function setupCardGroupStack() {
                var params = this.stackClassCommonParams();
                params.groupArea.leftX = this.canvas.width * 0.5;
                params.drawParams.rotationFuzzyness = 8;
                params.drawParams.centerFuzzyness = .1;

                this.cardGroups.stack = new _libMiscGroupOfCardsStack.Stack(params);
            }
        }, {
            key: 'setupCardGroupPile',
            value: function setupCardGroupPile() {
                var params = this.stackClassCommonParams();
                params.groupArea.leftX = this.canvas.width * 0.3;
                params.drawParams.rotationFuzzyness = 12;
                params.drawParams.centerFuzzyness = .1;

                this.cardGroups.pile = new _libMiscGroupOfCardsStack.Stack(params);
            }
        }, {
            key: 'setupCardGroupDiscarded',
            value: function setupCardGroupDiscarded() {
                var params = this.stackClassCommonParams();
                params.groupArea.leftX = this.canvas.width * 0.08;
                params.drawParams.rotationFuzzyness = 45;
                params.drawParams.centerFuzzyness = .5;

                this.cardGroups.discarded = new _libMiscGroupOfCardsStack.Stack(params);
            }

            // Pyramids
        }, {
            key: 'pyramidCommonParams',
            value: function pyramidCommonParams() {
                return {
                    scene: this.scene,
                    cardGenerator: this.cardGenerator,
                    groupArea: {
                        centerX: this.canvas.width * 0.7,
                        maxHeight: this.canvas.height * 0.4,
                        maxWidth: 1000
                    },
                    drawParams: {
                        rotationFuzzyness: 3,
                        centerFuzzyness: 0.05
                    }
                };
            }
        }, {
            key: 'setupMyPyramid',
            value: function setupMyPyramid() {
                var params = this.pyramidCommonParams();
                params.groupArea.direction = 'normal';
                params.groupArea.baseRowCenterY = this.canvas.height * 0.95;

                this.cardGroups.myPyramid = new _libMiscGroupOfCardsPyramid.Pyramid(params);
            }
        }, {
            key: 'setupOpponentsPyramid',
            value: function setupOpponentsPyramid() {
                var params = this.pyramidCommonParams();
                params.groupArea.direction = 'inverted';
                params.groupArea.baseRowCenterY = this.canvas.height * 0.05;

                this.cardGroups.opponentsPyramid = new _libMiscGroupOfCardsPyramid.Pyramid(params);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9maW5uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFhQSxtQkFBRyxlQUFlLENBQUMsWUFBWSxHQUFHO0FBQzlCLFlBQUksRUFBRSxjQUFVLE9BQU8sRUFBRTtBQUNyQixhQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDOzthQUVoQixDQUFDLENBQUM7U0FDTjtBQUNELGNBQU0sRUFBRSxnQkFBVSxPQUFPLEVBQUUsYUFBYSxFQUFFO0FBQ3RDLGdCQUFJLEtBQUssR0FBRyxhQUFhLEVBQUUsQ0FBQztBQUM1QixnQkFBRyxLQUFLLEVBQUUsRUFBRTtBQUNSLGlCQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVCLE1BQ0k7QUFDRCxpQkFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1QjtTQUNKO0tBQ0osQ0FBQTs7UUFFSyxLQUFLO0FBQ0ksaUJBRFQsS0FBSyxDQUNLLE1BQU0sRUFBRTs7O2tDQURsQixLQUFLOztBQUVILGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN4QyxnQkFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsZ0JBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQzVDLGdCQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3hDLGFBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUU1RSxnQkFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFeEMsZ0JBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN0QixnQkFBSSxRQUFRLEdBQUcsZ0VBQWdFLENBQUM7O0FBRWhGLGlCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hCLDRCQUFZLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNoRjs7QUFFRCxnQkFBSSxDQUFDLFlBQVksR0FBRyxlQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFaEQsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsa0JBNUNaLEtBQUssQ0E0Q2lCLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDOztBQUVoRCxnQkFBSSxDQUFDLElBQUksR0FBRyxpQkFoRFgsSUFBSSxDQWdEZ0IsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNwRCxnQkFBSSxDQUFDLFdBQVcsR0FBRyxlQUFHLFVBQVUsRUFBRSxDQUFDOztBQUVuQyxnQkFBSSxDQUFDLGFBQWEsR0FBRywwQkEvQ3BCLGFBQWEsQ0ErQ3lCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDOztBQUU5RCxnQkFBSSxDQUFDLFFBQVEsR0FBRyxlQUFHLFVBQVUsRUFBRSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0MsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsa0JBeERiLFlBQVksQ0F3RGtCO0FBQzNCLG9CQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZiw4QkFBYyxFQUFFLHdCQUFDLE9BQU87MkJBQUssTUFBSyxRQUFRLENBQUMsT0FBTyxDQUFDO2lCQUFBO2FBQ3RELENBQUMsQ0FBQztBQUNILGdCQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixnQkFBSSxDQUFDLGVBQWUsQ0FBQztBQUNyQixnQkFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLGdCQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBRyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0MsZ0JBQUksQ0FBQyxxQkFBcUIsR0FBRyxlQUFHLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFHcEQsZ0JBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDdEMsc0JBQUssZUFBZSxFQUFFLENBQUM7QUFDdkIsc0JBQUssbUJBQW1CLEVBQUUsQ0FBQzs7YUFFOUIsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBNkNOOztxQkF6RkMsS0FBSzs7bUJBMEZZLCtCQUFHOzs7QUFDbEIsb0JBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzdDLHdCQUFJLFFBQVEsR0FBRyxPQUFLLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLHdCQUFJLFdBQVcsQ0FBQzs7QUFFaEIsd0JBQUcsV0FBVyxHQUFHLE9BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDM0QsK0JBQUssV0FBVyxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7QUFDcEMsK0JBQUssV0FBVyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7cUJBQ3BDLE1BQ0ksSUFBRyxXQUFXLEdBQUcsT0FBSyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNsRSwrQkFBSyxXQUFXLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztBQUNwQywrQkFBSyxXQUFXLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztxQkFDcEMsTUFDSSxJQUFHLFdBQVcsR0FBRyxPQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2pFLCtCQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzVDLCtCQUFLLFdBQVcsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQ3BDLCtCQUFLLFdBQVcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO3FCQUNyQyxNQUNJLElBQUcsQ0FBQyxPQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFDcEMsQ0FBQyxPQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FDbEMsV0FBVyxHQUFHLE9BQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUEsQUFBQyxFQUFFOztBQUVuRSwrQkFBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsT0FBSyxZQUFZLENBQUMsQ0FBQzs7QUFFakUsK0JBQUssV0FBVyxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7QUFDcEMsK0JBQUssV0FBVyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDcEMsK0JBQUssV0FBVyxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDO3FCQUN0RSxNQUNJO0FBQ0QsK0JBQUssV0FBVyxHQUFHLEVBQUUsQ0FBQztxQkFDekI7QUFDRCwyQkFBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsT0FBSyxZQUFZLEVBQUUsT0FBSyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekUsMkJBQUssY0FBYyxFQUFFLENBQUM7aUJBQ3pCLENBQUMsQ0FBQzs7QUFFSCxvQkFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDekMsMkJBQUssZUFBZSxFQUFFLENBQUM7aUJBQzFCLENBQUMsQ0FBQzthQUNOOzs7bUJBRWMsMkJBQUc7Ozs7QUFFZCxvQkFBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLDJCQUFPO2lCQUNWOzs7Ozs7QUFNRCxvQkFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDeEMsb0JBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQ25DLHdCQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDeEIsK0JBQU87cUJBQ1Y7QUFDRCx3QkFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakIsaUNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZTtBQUMvQiw2QkFBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUs7QUFDakMsOEJBQU0sRUFBRSxNQUFNO0FBQ2QsbUNBQVcsRUFBRSxNQUFNO3FCQUN0QixDQUFDLENBQUM7aUJBQ04sTUFDSSxJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQzVCLHdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUN4RixNQUNJLElBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFOzs7QUFHeEMsd0JBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDL0IsK0JBQU87cUJBQ1Y7O0FBRUQsd0JBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDNUQsK0JBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQztxQkFDN0UsQ0FBQyxDQUFDO0FBQ0gsd0JBQUcsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBQ3pCLGdDQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsZ0NBQUksV0FBVyxHQUFHLEFBQUMsT0FBSyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUN2RCx1Q0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDOzZCQUN6RSxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRVAsZ0NBQUcsV0FBVyxDQUFDLEVBQUUsRUFBRTs7QUFFZixvQ0FBSSxrQkFBa0IsR0FBRyxPQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUNuRSwyQ0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUE7aUNBQ3pDLENBQUMsQ0FBQztBQUNILHVDQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDckQsb0NBQUcsa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0QsMkNBQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM1QywyQ0FBSyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzFDLDJDQUFLLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ3RELCtDQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDO3FDQUN6QixDQUFDLENBQUMsQ0FBQztpQ0FDUCxNQUNJLElBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ2pDLDJDQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakIsaURBQVMsRUFBRSxPQUFLLGVBQWU7QUFDL0IsNkNBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQztBQUNuQiw4Q0FBTSxFQUFFLE1BQU07QUFDZCxtREFBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FDQUNqQyxDQUFDLENBQUM7aUNBQ047NkJBQ0osTUFDSTtBQUNELHVDQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQzs2QkFDdEY7O3FCQUNKO2lCQUNKLE1BQ0ksSUFBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7QUFDcEUsMkJBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoRCx3QkFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakIsaUNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZTtBQUMvQiw4QkFBTSxFQUFFLE9BQU87QUFDZixtQ0FBVyxFQUFFLE1BQU07cUJBQ3RCLENBQUMsQ0FBQztpQkFDTixNQUNJLElBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzNDLDJCQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BFLHdCQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUM7QUFDaEUsd0JBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDOztBQUVsRSx3QkFBSSxXQUFXLENBQUM7QUFDaEIsd0JBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7QUFDM0UsNEJBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGdDQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQix5Q0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlO0FBQy9CLCtDQUFlLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRTtBQUMzRSxzQ0FBTSxFQUFFLFNBQVM7QUFDakIsMkNBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs2QkFDakMsQ0FBQyxDQUFDO3lCQUNOO3FCQUNKO2lCQUNKO2FBQ0o7OzttQkFDWSx5QkFBRztBQUNaLHVCQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqRCx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztBQUN4RCxvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7QUFDckMsb0JBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFNUMsb0JBQUksTUFBTSxDQUFDO0FBQ1gsaUJBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxFQUFFLEVBQUs7QUFDbkMsd0JBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQix3QkFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3BCLDhCQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO3FCQUN0QjtpQkFDSixDQUFDLENBQUM7QUFDSCxvQkFBRyxDQUFDLE1BQU0sRUFBRTtBQUNSLHdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQzlGLDJCQUFPO2lCQUNWOztBQUVELG9CQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDckIsaUJBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFLO0FBQy9CLHdCQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEIsMkJBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLDJCQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUUsQ0FBQztBQUMvQix3QkFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3BCLG1DQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO3FCQUN2RTtpQkFDSixDQUFDLENBQUM7QUFDSCxvQkFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLG9CQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRS9CLG9CQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtBQUNwQiwyQkFBTztpQkFDVjs7QUFFRCxvQkFBSSxXQUFXLEdBQUcsQUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDdkQsMkJBQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM5SCxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRVAsb0JBQUcsV0FBVyxFQUFFOztBQUVaLHdCQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQixpQ0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlO0FBQy9CLDZCQUFLLEVBQUUsV0FBVztBQUNsQiw4QkFBTSxFQUFFLE1BQU07QUFDZCxtQ0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3FCQUNqQyxDQUFDLENBQUM7aUJBQ047O0FBRUQsdUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM1RSx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2FBQ2pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdEWSx5QkFBRztBQUNaLG9CQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUMxQzs7O21CQUNnQiw2QkFBRztBQUNoQixvQkFBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFO0FBQzFCLHdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFL0Usd0JBQUcsT0FBTyxFQUFFO0FBQ1IsNEJBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxRCw0QkFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDeEI7aUJBQ0o7YUFDSjs7O21CQUNNLGlCQUFDLElBQUksRUFBRTtBQUNWLG9CQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEMsb0JBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRXBDLG9CQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDNUYsb0JBQUcsT0FBTyxFQUFFO0FBQ1Isd0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO2lCQUNsRSxNQUNJO0FBQ0Qsd0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSx5Q0FBeUMsRUFBQyxDQUFDLENBQUM7aUJBQ3pHO2FBQ0o7OzttQkFFWSx5QkFBRzs7O0FBQ1osb0JBQUksWUFBWSxHQUFHLDhCQWxYbEIsS0FBSyxDQWtYdUI7QUFDekIseUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSztBQUNqQixpQ0FBYSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQ2pDLDZCQUFTLEVBQUU7QUFDUCwrQkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUk7QUFDbEMsK0JBQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJO0FBQ2pDLGdDQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNoQyxpQ0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUc7cUJBQ3RDO0FBQ0QsOEJBQVUsRUFBRTtBQUNSLDZCQUFLLEVBQUUsR0FBRztBQUNWLHlDQUFpQixFQUFFLEdBQUc7QUFDdEIsdUNBQWUsRUFBRSxDQUFDO3FCQUNyQjtpQkFDSixDQUFDLENBQUM7QUFDSCxxQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLGdDQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDdkM7O0FBRUQscUNBQXFCLENBQUMsWUFBTTtBQUFFLDJCQUFLLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFBO2lCQUFDLENBQUMsQ0FBQzthQUM1RTs7O21CQUNvQiwrQkFBQyxZQUFZLEVBQUU7OztBQUNoQyxvQkFBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQzNCLDJCQUFPO2lCQUNWOztBQUVELG9CQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEUsNEJBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsb0JBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0MsNEJBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ25DLG9CQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3Qiw0QkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLHFDQUFxQixDQUFDLFlBQU07QUFBRSwyQkFBSyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQTtpQkFBQyxDQUFDLENBQUM7YUFDNUU7OzttQkFDZSwwQkFBQyxPQUFPLEVBQUU7QUFDdEIsb0JBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixvQkFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNoRCxvQkFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0FBQzFDLHVCQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqRSxvQkFBRyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7QUFDM0Isd0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7aUJBQzdFLE1BQ0k7QUFDRCx3QkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztpQkFDbkY7QUFDRCxvQkFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUFFLDJCQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO2lCQUFDLENBQUMsQ0FBQzthQUNyRTs7O21CQUNPLGtCQUFDLE9BQU8sRUFBRTtBQUNkLG9CQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2hDLHdCQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2xDLE1BQ0ksSUFBRyxPQUFPLENBQUMsT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUNoQyx3QkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUNuRyxNQUNJLElBQUcsT0FBTyxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUU7QUFDckMsd0JBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDbEM7YUFDSjs7O21CQUNlLDBCQUFDLE9BQU8sRUFBRTs7O0FBQ3RCLG9CQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLG9CQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDOztBQUVwQixvQkFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUMxQix1QkFBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWxELHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3RDLHdCQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3pCLHdCQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDOztBQUUzQix3QkFBRyxJQUFJLEtBQUssTUFBTSxJQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUU7QUFDakMsNEJBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQzdFLGdDQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNqRyxDQUFDLENBQUM7cUJBQ04sTUFDSSxJQUFHLElBQUksS0FBSyxnQkFBZ0IsSUFBSSxFQUFFLEtBQUssTUFBTSxFQUFFO0FBQ2hELDRCQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLDRCQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFDLElBQUksRUFBSztBQUNwRixnQ0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQzt5QkFDakcsQ0FBQyxDQUFDO3FCQUNOLE1BQ0ksSUFBRyxJQUFJLEtBQUssT0FBTyxJQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUU7QUFDdkMsNEJBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekUsNEJBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQzlFLGdDQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNuRyxDQUFDLENBQUM7cUJBQ04sTUFDSSxJQUFHLElBQUksS0FBSyxPQUFPLElBQUksRUFBRSxLQUFLLGdCQUFnQixFQUFFO0FBQ2pELDRCQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxVQUFDLElBQUksRUFBSztBQUNyRixnQ0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBSyxVQUFVLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQzt5QkFDMUcsQ0FBQyxDQUFDO3FCQUNOLE1BQ0ksSUFBRyxJQUFJLEtBQUssT0FBTyxJQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUU7QUFDdkMsK0JBQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUV0RCw0QkFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6RSw0QkFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDNUUsZ0NBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQ2hHLENBQUMsQ0FBQztxQkFDTixNQUNJLElBQUcsSUFBSSxLQUFLLE1BQU0sSUFBSSxFQUFFLEtBQUssTUFBTSxFQUFFO0FBQ3RDLCtCQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCw0QkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDN0UsZ0NBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQ25HLENBQUMsQ0FBQztxQkFFTixNQUNJLElBQUcsSUFBSSxLQUFLLE1BQU0sSUFBSSxFQUFFLEtBQUssZ0JBQWdCLEVBQUU7QUFDaEQsK0JBQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9ELDRCQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsRCw0QkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDcEYsZ0NBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQUssVUFBVSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQzFHLENBQUMsQ0FBQztxQkFDTixNQUNJLElBQUcsSUFBSSxLQUFLLE1BQU0sSUFBSSxFQUFFLEtBQUssV0FBVyxFQUFFO0FBQzNDLCtCQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxRCw0QkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsNEJBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2hGLGdDQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUN0RyxDQUFDLENBQUM7cUJBQ04sTUFDSSxJQUFHLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDeEIsK0JBQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsNEJBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7QUFDbEQsNEJBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7O0FBRXBELDRCQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXJFLDRCQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNuQyxxQ0FBUyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDL0M7O0FBRUQsNEJBQUcsRUFBRSxLQUFLLE1BQU0sRUFBRTtBQUNkLHFDQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDbEUsb0NBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7NkJBQ25HLENBQUMsQ0FBQzt5QkFDTixNQUNJLElBQUcsRUFBRSxLQUFLLE1BQU0sRUFBRTtBQUNuQixxQ0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2hFLG9DQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzZCQUNqRyxDQUFDLENBQUM7eUJBQ047cUJBRUosTUFDSSxJQUFHLElBQUksS0FBSyxtQkFBbUIsRUFBRTtBQUNsQywrQkFBTyxDQUFDLEdBQUcsQ0FBQyxpREFBaUQsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4RSw0QkFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQztBQUNsRCw0QkFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQzs7QUFFcEQsNEJBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUU1RSw0QkFBRyxFQUFFLEtBQUssZ0JBQWdCLEVBQUU7QUFDeEIscUNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxVQUFDLElBQUksRUFBSztBQUN6RSxvQ0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBSyxVQUFVLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQzs2QkFDMUcsQ0FBQyxDQUFDO3lCQUNOLE1BQ0ksSUFBRyxFQUFFLEtBQUssTUFBTSxFQUFFO0FBQ25CLHFDQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDaEUsb0NBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7NkJBQ2pHLENBQUMsQ0FBQzt5QkFDTjtxQkFDSjtpQkFDSjs7QUFFRCxvQkFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQUUsd0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtpQkFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3BFLHlDQUFxQixDQUFDOytCQUFNLE9BQUssYUFBYSxFQUFFO3FCQUFBLENBQUMsQ0FBQztpQkFDckQsTUFDSSxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFBRSx3QkFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO2lCQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDMUUseUNBQXFCLENBQUM7K0JBQU0sT0FBSyxhQUFhLEVBQUU7cUJBQUEsQ0FBQyxDQUFDO2lCQUNyRCxNQUNJLElBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBSztBQUFFLHdCQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7aUJBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUM5RSx5Q0FBcUIsQ0FBQzsrQkFBTSxPQUFLLGFBQWEsRUFBRTtxQkFBQSxDQUFDLENBQUM7aUJBQ3JELE1BQ0ksSUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQUUsd0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtpQkFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQzNFLHlDQUFxQixDQUFDOytCQUFNLE9BQUssYUFBYSxFQUFFO3FCQUFBLENBQUMsQ0FBQztpQkFDckQsTUFDSSxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFBRSx3QkFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO2lCQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDbEYseUNBQXFCLENBQUM7K0JBQU0sT0FBSyxhQUFhLEVBQUU7cUJBQUEsQ0FBQyxDQUFDO2lCQUNyRDs7QUFFRCxvQkFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO2FBQzdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQTZCUSxtQkFBQyxPQUFPLEVBQUU7OztBQUNmLHVCQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFBRSwyQkFBSyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFBRSxDQUFDLENBQUM7QUFDeEcsdUJBQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFBRSwyQkFBSyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFBRSxDQUFDLENBQUM7QUFDeEgsdUJBQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFBRSwyQkFBSyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFBRSxDQUFDLENBQUM7O0FBRWpJLG9CQUFJLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBQ3ZELG9CQUFJLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDOztBQUUzRCx1QkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDcEMseUJBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsSUFBSSxDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsRUFBRTtBQUNqRCw2QkFBSyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxJQUFLLENBQUMsR0FBRyxRQUFRLEFBQUMsRUFBRSxTQUFTLElBQUksQ0FBQyxFQUFFO0FBQ2pFLGdDQUFJLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLGdDQUFJLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1RSxtQ0FBSyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xGLG1DQUFLLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyRyxpREFBcUIsQ0FBQzt1Q0FBTSxPQUFLLGNBQWMsRUFBRTs2QkFBQSxDQUFDLENBQUM7eUJBQ3REO3FCQUVKOzs7Ozs7O2lCQVFKLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUFFLDJCQUFNO2lCQUFFLENBQUMsQ0FBQzthQUM3Qjs7O21CQUNhLDBCQUFHO0FBQ2Isb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRSxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV2QyxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakMsb0JBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzlCLG9CQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakMsb0JBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDeEMsb0JBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCLG9CQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUMvQjs7O21CQUNZLHlCQUFHOzs7QUFDWixvQkFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RCLG9CQUFJLFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFM0UscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDM0Msd0JBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5Qix3QkFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDOUMsNEJBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtxQkFDakIsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUNQLDZDQUFxQixDQUFDO21DQUFNLE9BQUssYUFBYSxFQUFFO3lCQUFBLENBQUMsQ0FBQztBQUNsRCw4QkFBTTtxQkFDVDtpQkFDSjthQUVKOzs7bUJBQ1csd0JBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzthQWlGZDs7O21CQUNhLHdCQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7OztBQUNwQixvQkFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV0QixvQkFBRyxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQ1IsMkJBQU87aUJBQ1Y7QUFDRCx1QkFBTyxxQkFBcUIsQ0FBQzsyQkFBTSxPQUFLLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFBQSxDQUFDLENBQUM7YUFDeEU7OzttQkFDSSxpQkFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlSixvQkFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RCLG9CQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUd0QyxvQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLG9CQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUUsQ0FBQztBQUNqSixvQkFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFDakosb0JBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ3BKLG9CQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUUsQ0FBQztBQUNqSixvQkFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFFLENBQUM7O0FBRWhKLG9CQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixvQkFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7O0FBRXpCLG9CQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBSztBQUM3Qyx3QkFBSSxRQUFRLEdBQUcsUUFBSyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFekMsd0JBQUcsUUFBSyxZQUFZLEtBQUssSUFBSSxFQUFFO0FBQzNCLDRCQUFJLE1BQU0sR0FBRztBQUNULDZCQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDYiw2QkFBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2IscUNBQVMsRUFBRSxJQUFJO3lCQUNsQixDQUFDOztBQUVGLGdDQUFLLElBQUksQ0FBQyxRQUFLLFlBQVksQ0FBQyxDQUFDO0FBQzdCLGdDQUFLLEtBQUssQ0FBQyxRQUFLLFlBQVksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxnQ0FBSyxLQUFLLENBQUMsUUFBSyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ2hELE1BQ0k7QUFDRCw0QkFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDOztBQUVsQixnQ0FBUSxFQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBSyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdDLGdDQUFHLFFBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNoQyxpQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUNsQyx3Q0FBSyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLHdDQUFLLFlBQVksQ0FBQyxPQUFPLEdBQUcsUUFBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxRQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1RSx3Q0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLFlBQU07QUFDZix3Q0FBSSxJQUFJLEdBQUcsUUFBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXpCLHlDQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pCLDZEQUFxQixDQUFDLFlBQU07QUFDeEIsZ0RBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN4RSxnREFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3lDQUNwRSxDQUFDLENBQUM7cUNBQ047aUNBQ0osQ0FBQyxDQUFDO0FBQ0gscUNBQUssR0FBRyxJQUFJLENBQUM7QUFDYixzQ0FBTSxRQUFRLENBQUM7NkJBQ2xCO0FBQ0QsNkJBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7eUJBQ3JDO0FBQ0QsNEJBQUcsQ0FBQyxLQUFLLEVBQUU7QUFDUCxvQ0FBSyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLGlDQUFLLElBQUksQ0FBQyxHQUFHLFFBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pDLHdDQUFLLElBQUksRUFBRSxDQUFDO0FBQ1osaUNBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDbEMsd0NBQUssWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUM1Qjt5QkFDSjtxQkFDSjtpQkFDSixDQUFDLENBQUM7QUFDSCxvQkFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDN0Msd0JBQUksUUFBUSxHQUFHLFFBQUssaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsMkJBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDN0Isd0JBQUcsUUFBSyxjQUFjLEtBQUssSUFBSSxFQUFFO0FBQzdCLGdDQUFLLFlBQVksR0FBRyxRQUFLLGNBQWMsQ0FBQztxQkFDM0M7aUJBQ0osQ0FBQyxDQUFDO0FBQ0gsb0JBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzNDLDRCQUFLLElBQUksRUFBRSxDQUFDO0FBQ1osNEJBQUssWUFBWSxHQUFHLElBQUksQ0FBQztpQkFDNUIsQ0FBQyxDQUFDO2FBQ047OzttQkFDRyxnQkFBMkM7b0JBQTFDLFlBQVkseURBQUcsQ0FBQyxHQUFHO29CQUFFLFFBQVEseURBQUcsWUFBTSxFQUFFOztBQUN6QyxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdkMscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4Qyx3QkFBRyxDQUFDLEtBQUssWUFBWSxFQUFFO0FBQ25CLGdDQUFRLEVBQUUsQ0FBQztxQkFDZCxNQUNJO0FBQ0QsNEJBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQzdDO2lCQUNKO2FBQ0o7OzttQkFDZ0IsMkJBQUMsQ0FBQyxFQUFFO0FBQ2pCLG9CQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDakQsdUJBQU87QUFDSCxxQkFBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUk7QUFDMUIscUJBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHO2lCQUM1QixDQUFDO2FBQ0w7OzttQkFDVyxzQkFBQyxPQUFPLEVBQUU7QUFDbEIsb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLG9CQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUM7QUFDL0Isb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUM3QixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUV0Qzs7O21CQVFjLDJCQUFHO0FBQ2Qsb0JBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0FBQzVCLG9CQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsb0JBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0FBQ25DLG9CQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUM3QixvQkFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0Isb0JBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzFCLG9CQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzthQUNsQzs7Ozs7bUJBR2UsNEJBQUc7QUFDZix1QkFBTztBQUNILHlCQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7QUFDakIsaUNBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUNqQyw2QkFBUyxFQUFFO0FBQ1AsNkJBQUssRUFBRSxFQUFFO0FBQ1QsK0JBQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJO0FBQ2xDLGdDQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQztBQUMvQixpQ0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7cUJBQ3BDO0FBQ0QsOEJBQVUsRUFBRTtBQUNSLDZCQUFLLEVBQUUsR0FBRztBQUNWLG9DQUFZLEVBQUUsQ0FBQztBQUNmLHlDQUFpQixFQUFFLENBQUM7QUFDcEIsdUNBQWUsRUFBRSxJQUFJO3FCQUN4QjtpQkFDSixDQUFDO2FBQ0w7OzttQkFDbUIsZ0NBQUc7QUFDbkIsb0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3JDLHNCQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQ3BELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLDZCQWgzQnhCLElBQUksQ0FnM0I2QixNQUFNLENBQUMsQ0FBQzthQUM3Qzs7O21CQUMwQix1Q0FBRztBQUMxQixvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDckMsc0JBQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksRUFDcEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUcsNkJBcjNCL0IsSUFBSSxDQXEzQm9DLE1BQU0sQ0FBQyxDQUFDO2FBQ3BEOzs7OzttQkFFcUIsa0NBQUc7QUFDckIsdUJBQU87QUFDSCx5QkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQ2pCLGlDQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDakMsNkJBQVMsRUFBRTs7QUFFUCwrQkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7QUFDL0IsZ0NBQVEsRUFBRSxHQUFHO0FBQ2IsaUNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDO3FCQUNwQztBQUNELDhCQUFVLEVBQUU7QUFDUiw2QkFBSyxFQUFFLEdBQUc7QUFDVixvQ0FBWSxFQUFFLENBQUM7cUJBQ2xCO2lCQUNKLENBQUM7YUFDTDs7O21CQUNrQiwrQkFBRztBQUNsQixvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0Msc0JBQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNqRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDeEMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkMsb0JBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLDhCQTc0QnZCLEtBQUssQ0E2NEI0QixNQUFNLENBQUMsQ0FBQzthQUM3Qzs7O21CQUNpQiw4QkFBRztBQUNqQixvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0Msc0JBQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNqRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDekMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkMsb0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLDhCQXI1QnRCLEtBQUssQ0FxNUIyQixNQUFNLENBQUMsQ0FBQzthQUM1Qzs7O21CQUNzQixtQ0FBRztBQUN0QixvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0Msc0JBQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsRCxzQkFBTSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDekMsc0JBQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkMsb0JBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLDhCQTc1QjNCLEtBQUssQ0E2NUJnQyxNQUFNLENBQUMsQ0FBQzthQUNqRDs7Ozs7bUJBRWtCLCtCQUFHO0FBQ2xCLHVCQUFPO0FBQ0gseUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSztBQUNqQixpQ0FBYSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQ2pDLDZCQUFTLEVBQUU7QUFDUCwrQkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUc7QUFDaEMsaUNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHO0FBQ25DLGdDQUFRLEVBQUUsSUFBSTtxQkFDakI7QUFDRCw4QkFBVSxFQUFFO0FBQ1IseUNBQWlCLEVBQUUsQ0FBQztBQUNwQix1Q0FBZSxFQUFFLElBQUk7cUJBQ3hCO2lCQUNKLENBQUM7YUFDTDs7O21CQUNhLDBCQUFHO0FBQ2Isb0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3hDLHNCQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDdEMsc0JBQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFNUQsb0JBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLGdDQW43QjNCLE9BQU8sQ0FtN0JnQyxNQUFNLENBQUMsQ0FBQzthQUNuRDs7O21CQUNvQixpQ0FBRztBQUNwQixvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEMsc0JBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUN4QyxzQkFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUU1RCxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxnQ0ExN0JsQyxPQUFPLENBMDdCdUMsTUFBTSxDQUFDLENBQUM7YUFDMUQ7OzttQkFFTSxtQkFBRzs7O2FBR1Q7OztlQTU2QkMsS0FBSzs7O3FCQSs2QkksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsNEJBQWdCLEVBQUUiLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL2Zpbm5lL2Zpbm5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB0ZW1wbGF0ZU1hcmt1cCBmcm9tICd0ZXh0IS4vZmlubmUuaHRtbCc7XG5pbXBvcnQgeyBDb21tdW5pY2F0b3IgfSBmcm9tICcuL2NvbW11bmljYXRvcic7XG5pbXBvcnQgeyBDaGF0IH0gZnJvbSAnLi4vLi4vbGliL21pc2MvY2hhdCc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi8uLi9saWIvbWlzYy90cmFuc2Zvcm0nO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tICcuLi8uLi9saWIvbWlzYy9zY2VuZSc7XG5pbXBvcnQgeyBDYXJkIH0gZnJvbSAnLi4vLi4vbGliL21pc2MvY2FyZCc7XG5pbXBvcnQgeyBDYXJkR2VuZXJhdG9yIH0gZnJvbSAnLi4vLi4vbGliL21pc2MvY2FyZC1nZW5lcmF0b3InO1xuaW1wb3J0IHsgSGFuZCB9IGZyb20gJy4uLy4uL2xpYi9taXNjL2dyb3VwLW9mLWNhcmRzLmhhbmQnO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tICcuLi8uLi9saWIvbWlzYy9ncm91cC1vZi1jYXJkcy5zdGFjayc7XG5pbXBvcnQgeyBQeXJhbWlkIH0gZnJvbSAnLi4vLi4vbGliL21pc2MvZ3JvdXAtb2YtY2FyZHMucHlyYW1pZCc7XG5pbXBvcnQgY29weUFycmF5IGZyb20gJy4uLy4uL2xpYi9taXNjL3V0aWxpdGllcyc7XG5cbmtvLmJpbmRpbmdIYW5kbGVycy5tb2RhbFZpc2libGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgJChlbGVtZW50KS5tb2RhbCh7XG4gICAgICAvKiAgICAgIGJhY2tkcm9wOiAnc3RhdGljJywqL1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBpZih2YWx1ZSgpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEZpbm5lIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdmFyICRnYW1lQXJlYSA9ICQoJyNmaW5uZS1wYWdlIGNhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcyA9ICRnYW1lQXJlYVswXTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDIwMDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICAkKCcjZmlubmUtcGFnZScpLmNzcygnYmFja2dyb3VuZC1zaXplJywgJ2F1dG8gJyArIHRoaXMuY2FudmFzLndpZHRoICsgJ3B4Jyk7XG5cbiAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHBvc3NpYmxlTmFtZSA9IFwiXCI7XG4gICAgICAgIHZhciBwb3NzaWJsZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlcIjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgcG9zc2libGVOYW1lICs9IHBvc3NpYmxlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwb3NzaWJsZS5sZW5ndGgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zc2libGVOYW1lID0ga28ub2JzZXJ2YWJsZShwb3NzaWJsZU5hbWUpO1xuXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoeyBjYW52YXM6IHRoaXMuY2FudmFzIH0pO1xuXG4gICAgICAgIHRoaXMuY2hhdCA9IG5ldyBDaGF0KHsgc2Nyb2xsRm9sbG93OiAnI2NoYXQtbG9nJyB9KTtcbiAgICAgICAgdGhpcy5jaGF0TWVzc2FnZSA9IGtvLm9ic2VydmFibGUoKTtcblxuICAgICAgICB0aGlzLmNhcmRHZW5lcmF0b3IgPSBuZXcgQ2FyZEdlbmVyYXRvcih7IHNjZW5lOiB0aGlzLnNjZW5lIH0pO1xuXG4gICAgICAgIHRoaXMuZ2FtZUNvZGUgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FtZUlzSW5Qcm9ncmVzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBDb21tdW5pY2F0b3Ioe1xuICAgICAgICAgICAgY2hhdDogdGhpcy5jaGF0LFxuICAgICAgICAgICAgaGFuZGxlSW5jb21pbmc6IChtZXNzYWdlKSA9PiB0aGlzLmluY29taW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzID0ge307XG4gICAgICAgIHRoaXMucGxheWVyU2lnbmF0dXJlO1xuICAgICAgICB0aGlzLmhvdmVyZWRDYXJkID0ge307XG4gICAgICAgIHRoaXMuYWxsb3dlZFBsYXlzID0ge307XG4gICAgICAgIHRoaXMucG9wdXBDYXJkQ2hvaWNlcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG4gICAgICAgIHRoaXMucG9wdXBDYXJkRGVzdGluYXRpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcblxuXG4gICAgICAgIHRoaXMuY2FyZEdlbmVyYXRvci5sb2FkQ2FyZHMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0dXBDYXJkR3JvdXBzKCk7XG4gICAgICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgICAgLy8gdGhpcy5zaG93U2h1ZmZsaW5nKClcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyAgY2FyZHNMb2FkZWRQcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuXG4gICAgICAgIC8vICAgICB0aGlzLnNob3dTaHVmZmxpbmcoKTtcbiAgICAgICAgLy8gICAgIHRoaXMuc2V0dXBDYXJkR3JvdXBzKCk7XG4gICAgICAgIC8qXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMub3Bwb25lbnRIYW5kKTtcblxuICAgICAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzaXplIGZpcmVkJywgZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIDMwMDtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldEN1cnNvckxvY2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQubWFya0hvdmVyYWJsZShwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLnN0YWNrLm1hcmtIb3ZlcmFibGUocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5waWxlLm1hcmtIb3ZlcmFibGUocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQubWFya0hvdmVyYWJsZShwb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2FyZEdyb3VwcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHBpbGVQb3NpdGlvbiA9IHRoaXMuY2FyZEdyb3Vwcy5waWxlLm5ld0NhcmRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQubW92ZUhvdmVyZWRPbnRvKHRoaXMuY2FyZEdyb3Vwcy5waWxlLCAoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGlsZXBvc2l0aW9uJywgcGlsZVBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiBwaWxlUG9zaXRpb24gfSlcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdDYXJkR3JvdXBzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYXJkR3JvdXBzLnBpbGUuY2FyZHMubWFwKChjYXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLmhhc01vdmUoKVxuICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmFDYXJkSXNNb3ZpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUFDYXJkKCk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7Ki9cbiAgICAgICAvLyB9KTtcbiAgICB9XG4gICAgc2V0dXBFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0Q3Vyc29yTG9jYXRpb24oZSk7XG4gICAgICAgICAgICB2YXIgaG92ZXJlZENhcmQ7XG5cbiAgICAgICAgICAgIGlmKGhvdmVyZWRDYXJkID0gdGhpcy5jYXJkR3JvdXBzLnBpbGUubWFya0hvdmVyYWJsZShwb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhvdmVyZWRDYXJkLmNhcmQgPSBob3ZlcmVkQ2FyZDtcbiAgICAgICAgICAgICAgICB0aGlzLmhvdmVyZWRDYXJkLm9yaWdpbiA9ICdwaWxlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoaG92ZXJlZENhcmQgPSB0aGlzLmNhcmRHcm91cHMubXlIYW5kLm1hcmtIb3ZlcmFibGUocG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ob3ZlcmVkQ2FyZC5jYXJkID0gaG92ZXJlZENhcmQ7XG4gICAgICAgICAgICAgICAgdGhpcy5ob3ZlcmVkQ2FyZC5vcmlnaW4gPSAnaGFuZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGhvdmVyZWRDYXJkID0gdGhpcy5jYXJkR3JvdXBzLnN0YWNrLm1hcmtIb3ZlcmFibGUocG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hvdmVyY2FyZCBzdGFjaycsIGhvdmVyZWRDYXJkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhvdmVyZWRDYXJkLmNhcmQgPSBob3ZlcmVkQ2FyZDtcbiAgICAgICAgICAgICAgICB0aGlzLmhvdmVyZWRDYXJkLm9yaWdpbiA9ICdzdGFjayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKCF0aGlzLmNhcmRHcm91cHMubXlIYW5kLmNhcmRzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAmJiAhdGhpcy5jYXJkR3JvdXBzLnN0YWNrLmNhcmRzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAmJiAoaG92ZXJlZENhcmQgPSB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLm1hcmtIb3ZlcmFibGUocG9zaXRpb24pKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdob3ZlcmNhcmQgcHlyYW1pZCcsIGhvdmVyZWRDYXJkLCB0aGlzLmFsbG93ZWRQbGF5cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3ZlcmVkQ2FyZC5jYXJkID0gaG92ZXJlZENhcmQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG92ZXJlZENhcmQub3JpZ2luID0gJ3B5cmFtaWQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvdmVyZWRDYXJkLnB5cmFtaWRMb2NhdGlvbiA9IGhvdmVyZWRDYXJkLnB5cmFtaWRMb2NhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaG92ZXJlZENhcmQgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhZnRlciBob3ZlcicsIHRoaXMuYWxsb3dlZFBsYXlzLCB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0NhcmRHcm91cHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hdHRlbXB0TWFrZVBsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1ha2VQbGF5KCkge1xuICAgICAgICAvLyBubyBjYXJkIGhvdmVyZWRcbiAgICAgICAgaWYoIXRoaXMuaG92ZXJlZENhcmQuY2FyZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSBlYXJsaWVyIHBsYXlzIGluZm9ybWF0aW9uIGZyb20gY2hhdFxuICAgIC8vICAgIHRoaXMuY2hhdC5jaGF0TWVzc2FnZXModGhpcy5jaGF0LmNoYXRNZXNzYWdlcygpLmZpbHRlcigoY2hhdE1lc3NhZ2UpID0+IHtcbiAgICAvLyAgICAgICAgcmV0dXJuIGNoYXRNZXNzYWdlLmNsYXNzTmFtZSAhPT0gJ2NoYXQtc3RhdHVzLXNlcnZlci1wbGF5JztcbiAgICAvLyAgICB9KSk7XG4gICAgXG4gICAgICAgIHZhciBob3ZlcmVkQ2FyZCA9IHRoaXMuaG92ZXJlZENhcmQuY2FyZDtcbiAgICAgICAgaWYodGhpcy5ob3ZlcmVkQ2FyZC5vcmlnaW4gPT09ICdwaWxlJykge1xuICAgICAgICAgICAgaWYoIXRoaXMuYWxsb3dlZFBsYXlzLnBpbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlcnZlci5tYWtlUGxheSh7XG4gICAgICAgICAgICAgICAgc2lnbmF0dXJlOiB0aGlzLnBsYXllclNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICBjYXJkczogdGhpcy5jYXJkR3JvdXBzLnBpbGUuY2FyZHMsXG4gICAgICAgICAgICAgICAgb3JpZ2luOiAncGlsZScsXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb246ICdoYW5kJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5hbGxvd2VkUGxheXMucGlsZSkge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiAnWW91IG11c3QgcGljayB1cCB0aGUgcGlsZScsIHN0YXR1czogJ3BsYXknIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5ob3ZlcmVkQ2FyZC5vcmlnaW4gPT09ICdoYW5kJykge1xuXG4gICAgICAgICAgICAvLyBub3RoaW5nIGFsbG93ZWRcbiAgICAgICAgICAgIGlmKCF0aGlzLmFsbG93ZWRQbGF5cy5oYW5kLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNhcmRzT25IYW5kID0gdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5jYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FyZC5zdWl0ID09PSBob3ZlcmVkQ2FyZC5zdWl0ICYmIGNhcmQudmFsdWUgPT09IGhvdmVyZWRDYXJkLnZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZihjYXJkc09uSGFuZC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2FyZE9uSGFuZCA9IGNhcmRzT25IYW5kWzBdO1xuICAgICAgICAgICAgICAgIGxldCBhbGxvd2VkUGxheSA9ICh0aGlzLmFsbG93ZWRQbGF5cy5oYW5kLmZpbHRlcigocGxheSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FyZE9uSGFuZC5zdWl0ID09PSBwbGF5LnN1aXQsIGNhcmRPbkhhbmQudmFsdWUgPT09IHBsYXkudmFsdWU7XG4gICAgICAgICAgICAgICAgfSkpWzBdO1xuXG4gICAgICAgICAgICAgICAgaWYoYWxsb3dlZFBsYXkudG8pIHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZHNXaXRoU2FtZVZhbHVlID0gdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5jYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXJkLnZhbHVlID09PSBjYXJkT25IYW5kLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2FyZHMsIHNhbWUgdmFsdWUnLCBjYXJkc1dpdGhTYW1lVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZihjYXJkc1dpdGhTYW1lVmFsdWUubGVuZ3RoID4gMSB8fCBhbGxvd2VkUGxheS50by5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2V0cyBvdGhlckNhcmRzV2l0aFNhbWVWYWx1ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1cENhcmRDaG9pY2VzKGNhcmRzV2l0aFNhbWVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVwQ2FyZERlc3RpbmF0aW9ucyhhbGxvd2VkUGxheS50by5tYXAoKHRoaXNUbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRvOiB0aGlzVG8gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKGFsbG93ZWRQbGF5LnRvLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIubWFrZVBsYXkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hdHVyZTogdGhpcy5wbGF5ZXJTaWduYXR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZHM6IFtjYXJkT25IYW5kXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW46ICdoYW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogYWxsb3dlZFBsYXkudG9bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiAnQ2FudCBtYWtlIHRoYXQgbW92ZScsIHN0YXR1czogJ3dhcm5pbmdzJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmhvdmVyZWRDYXJkLm9yaWdpbiA9PT0gJ3N0YWNrJyAmJiB0aGlzLmFsbG93ZWRQbGF5cy5zdGFjaykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FsbG93ZWQgcGxheXMnLCB0aGlzLmFsbG93ZWRQbGF5cyk7XG4gICAgICAgICAgICB0aGlzLnNlcnZlci5tYWtlUGxheSh7XG4gICAgICAgICAgICAgICAgc2lnbmF0dXJlOiB0aGlzLnBsYXllclNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICBvcmlnaW46ICdzdGFjaycsXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb246ICdwaWxlJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5ob3ZlcmVkQ2FyZC5vcmlnaW4gPT09ICdweXJhbWlkJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2F0dGVtcHRNYWtlUGxheScsIHRoaXMuaG92ZXJlZENhcmQsIHRoaXMuYWxsb3dlZFBsYXlzKTtcbiAgICAgICAgICAgIGxldCBob3ZlcmVkUm93SW5kZXggPSB0aGlzLmhvdmVyZWRDYXJkLnB5cmFtaWRMb2NhdGlvbi5yb3dJbmRleDtcbiAgICAgICAgICAgIGxldCBob3ZlcmVkQ2FyZEluZGV4ID0gdGhpcy5ob3ZlcmVkQ2FyZC5weXJhbWlkTG9jYXRpb24uY2FyZEluZGV4O1xuXG4gICAgICAgICAgICB2YXIgYWxsb3dlZFBsYXk7XG4gICAgICAgICAgICBpZihhbGxvd2VkUGxheSA9IHRoaXMuYWxsb3dlZFBsYXlzLnB5cmFtaWRbaG92ZXJlZFJvd0luZGV4XVtob3ZlcmVkQ2FyZEluZGV4XSkge1xuICAgICAgICAgICAgICAgIGlmKGFsbG93ZWRQbGF5LnRvLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5tYWtlUGxheSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYXR1cmU6IHRoaXMucGxheWVyU2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlyYW1pZExvY2F0aW9uOiB7IHJvd0luZGV4OiBob3ZlcmVkUm93SW5kZXgsIGNhcmRJbmRleDogaG92ZXJlZENhcmRJbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiAncHlyYW1pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogYWxsb3dlZFBsYXkudG9bMF0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwb3B1cE1ha2VNb3ZlKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWFkZSBwb3B1cCBtb3ZlJywgdGhpcy5ob3ZlcmVkQ2FyZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoJy5jYXJkLWNob2ljZXMnKSwgJCgnLmNhcmQtZGVzdGluYXRpb24nKSk7XG4gICAgICAgIGxldCBvcmlnaW4gPSB0aGlzLmhvdmVyZWRDYXJkLm9yaWdpbjtcbiAgICAgICAgbGV0IGNhcmRWYWx1ZSA9IHRoaXMuaG92ZXJlZENhcmQuY2FyZC52YWx1ZTtcblxuICAgICAgICB2YXIgcGxheVRvO1xuICAgICAgICAkKCcuY2FyZC1kZXN0aW5hdGlvbicpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlbCk7XG4gICAgICAgICAgICBpZigkZWwucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgICAgcGxheVRvID0gJGVsLnZhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIXBsYXlUbykge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiBcIkRlc3RpbmF0aW9uIG5vdCBjaG9zZW4sIGNhbid0IHBsYXlcIiwgc3RhdHVzOiAncGxheScgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FyZHNUb1BsYXkgPSBbXTtcbiAgICAgICAgJCgnLmNhcmQtY2hvaWNlcycpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJChlbCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZWwnLCAkZWwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3ZhbCcsICRlbC52YWwoKSApO1xuICAgICAgICAgICAgaWYoJGVsLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgICAgIGNhcmRzVG9QbGF5LnB1c2goeyB2YWx1ZTogY2FyZFZhbHVlLCBzdWl0OiAkZWwudmFsKCksIHRvOiBwbGF5VG8gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBvcHVwQ2FyZENob2ljZXMoW10pO1xuICAgICAgICB0aGlzLnBvcHVwQ2FyZERlc3RpbmF0aW9ucyhbXSk7XG5cbiAgICAgICAgaWYoIWNhcmRzVG9QbGF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFsbG93ZWRQbGF5ID0gKHRoaXMuYWxsb3dlZFBsYXlzLmhhbmQuZmlsdGVyKChwbGF5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2FyZHNUb1BsYXlbMF0uc3VpdCA9PT0gcGxheS5zdWl0ICYmIGNhcmRzVG9QbGF5WzBdLnZhbHVlID09PSBwbGF5LnZhbHVlICYmIHBsYXkudG8uaW5kZXhPZihjYXJkc1RvUGxheVswXS50bykgPj0gMDtcbiAgICAgICAgfSkpWzBdO1xuXG4gICAgICAgIGlmKGFsbG93ZWRQbGF5KSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2VydmVyLm1ha2VQbGF5KHtcbiAgICAgICAgICAgICAgICBzaWduYXR1cmU6IHRoaXMucGxheWVyU2lnbmF0dXJlLFxuICAgICAgICAgICAgICAgIGNhcmRzOiBjYXJkc1RvUGxheSxcbiAgICAgICAgICAgICAgICBvcmlnaW46ICdoYW5kJyxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogY2FyZHNUb1BsYXlbMF0udG8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJCgnLmNhcmQtY2hvaWNlLXZhbHVlJyksICQoJy5jYXJkLWNob2ljZS12YWx1ZScpLmZpcnN0KCkudmFsKCkpO1xuICAgICAgICBjb25zb2xlLmxvZygnZW5kIHBvcHVwIG1vdmUnKTtcbiAgICB9XG4vLyAgICAgICAgICAgIGlmKHRoaXMuaG92ZXJlZENhcmQuY2FyZCkge1xuLy8gICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIubWFrZVBsYXkoe1xuLy8gICAgICAgICAgICAgICAgICAgIHNpZ25hdHVyZTogdGhpcy5wbGF5ZXJTaWduYXR1cmUsXG4vLyAgICAgICAgICAgICAgICAgICAgY2FyZDogdGhpcy5ob3ZlcmVkQ2FyZC5jYXJkLFxuLy8gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogdGhpcy5ob3ZlcmVkQ2FyZC5vcmlnaW4sXG4vLyAgICAgICAgICAgICAgICB9KVxuLy8gICAgICAgICAgICAgICAgLnRoZW4oKHZhbHVlKSA9PiB7XG4vL1xuLy8gICAgICAgICAgICAgICAgfSxcbi8vICAgICAgICAgICAgICAgIChyZWFzb24pID0+IHtcbi8vICAgICAgICAgICAgICAgICAgICBcbi8vICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIHZhciBzdWNjZXNzID0gdGhpcy5zZXJ2ZXIuam9pbkdhbWUoeyBwbGF5ZXJfbmFtZTogcGxheWVyTmFtZSwgZ2FtZV9jb2RlOiB0aGlzLmdhbWVDb2RlKCkgfSk7XG4vLyAgICAgICAgICAgIGlmKHN1Y2Nlc3MpIHtcbi8vICAgICAgICAgICAgICAgIHRoaXMuY2hhdC5wdXQoeyBmcm9tOiAnc2VydmVyJywgdGV4dDogJ0Nvbm5lY3RlZCB0byBzZXJ2ZXInIH0pO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCBzdGF0dXM6ICd3YXJuaW5ncycsIHRleHQ6ICdGYWlsZWQgdG8gY29ubmVjdCB0byBzZXJ2ZXIsIHRyeSBhZ2Fpbi4nfSk7XG4vLyAgICAgICAgICAgIH1cblxuXG4vKlxuXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIHBpbGVQb3NpdGlvbiA9IHRoaXMuY2FyZEdyb3Vwcy5waWxlLm5ld0NhcmRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQubW92ZUhvdmVyZWRPbnRvKHRoaXMuY2FyZEdyb3Vwcy5waWxlLCAoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGlsZXBvc2l0aW9uJywgcGlsZVBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiBwaWxlUG9zaXRpb24gfSlcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdDYXJkR3JvdXBzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5jYXJkR3JvdXBzLnBpbGUuY2FyZHMubWFwKChjYXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLmhhc01vdmUoKVxuICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmFDYXJkSXNNb3ZpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4qL1xuXG5cblxuXG5cbiAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBpbiBwcm9kdWN0aW9uLi4uXG4gICAgY2xlYXJBbGxHYW1lcygpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuc2VuZENvbW1hbmQoJ3Jlc2V0X2dhbWVzJyk7XG4gICAgfVxuICAgIHN1Ym1pdENoYXRNZXNzYWdlKCkge1xuICAgICAgICBpZih0aGlzLmNoYXRNZXNzYWdlKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMuc2VydmVyLnNlbmRDb21tYW5kKCdjaGF0JywgeyBtZXNzYWdlOiB0aGlzLmNoYXRNZXNzYWdlKCkgfSk7XG5cbiAgICAgICAgICAgIGlmKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogJ3NlbGYnLCB0ZXh0OiB0aGlzLmNoYXRNZXNzYWdlKCkgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGF0TWVzc2FnZSgnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbmV3R2FtZShmb3JtKSB7XG4gICAgICAgIHZhciBwbGF5ZXJOYW1lID0gJCgnI25hbWUnKS52YWwoKTtcbiAgICAgICAgdGhpcy5nYW1lQ29kZSgkKCcjZ2FtZWNvZGUnKS52YWwoKSk7XG5cbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnNlcnZlci5qb2luR2FtZSh7IHBsYXllcl9uYW1lOiBwbGF5ZXJOYW1lLCBnYW1lX2NvZGU6IHRoaXMuZ2FtZUNvZGUoKSB9KTtcbiAgICAgICAgaWYoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiAnQ29ubmVjdGVkIHRvIHNlcnZlcicgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogJ3NlcnZlcicsIHN0YXR1czogJ3dhcm5pbmdzJywgdGV4dDogJ0ZhaWxlZCB0byBjb25uZWN0IHRvIHNlcnZlciwgdHJ5IGFnYWluLid9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dTaHVmZmxpbmcoKSB7XG4gICAgICAgIHZhciBzaG93U2h1ZmZsZXIgPSBuZXcgU3RhY2soe1xuICAgICAgICAgICAgc2NlbmU6IHRoaXMuc2NlbmUsXG4gICAgICAgICAgICBjYXJkR2VuZXJhdG9yOiB0aGlzLmNhcmRHZW5lcmF0b3IsXG4gICAgICAgICAgICBncm91cEFyZWE6IHtcbiAgICAgICAgICAgICAgICBjZW50ZXJZOiB0aGlzLmNhbnZhcy5oZWlnaHQgKiAwLjI1LFxuICAgICAgICAgICAgICAgIGNlbnRlclg6IHRoaXMuY2FudmFzLndpZHRoICogMC40NSxcbiAgICAgICAgICAgICAgICBtYXhXaWR0aDogdGhpcy5jYW52YXMud2lkdGggKiAuMixcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodCAqIDAuMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkcmF3UGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgICAgICAgICByb3RhdGlvbkZ1enp5bmVzczogMTgwLFxuICAgICAgICAgICAgICAgIGNlbnRlckZ1enp5bmVzczogNCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSA1MjsgaSArPSAxKSB7XG4gICAgICAgICAgICBzaG93U2h1ZmZsZXIuYWRkQ2FyZCgnYmFjaycsICdyZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7IHRoaXMuc2hvd1NodWZmbGluZ0FuaW1hdGVkKHNob3dTaHVmZmxlcil9KTtcbiAgICB9XG4gICAgc2hvd1NodWZmbGluZ0FuaW1hdGVkKHNob3dTaHVmZmxlcikge1xuICAgICAgICBpZighc2hvd1NodWZmbGVyLmNhcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBzaG93U2h1ZmZsZXIuY2FyZHMucG9wKCk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5zdGFjay5hZGRDYXJkKCdiYWNrJywgJ3JlZCcpO1xuICAgICAgICBzaG93U2h1ZmZsZXIucmVyYW5kb21pemVBbGxDYXJkcygpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2suZHJhdygpO1xuICAgICAgICBzaG93U2h1ZmZsZXIuZHJhdygpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4geyB0aGlzLnNob3dTaHVmZmxpbmdBbmltYXRlZChzaG93U2h1ZmZsZXIpfSk7XG4gICAgfVxuICAgIGluY29taW5nSW5pdEdhbWUobWVzc2FnZSkge1xuICAgICAgICB0aGlzLmdhbWVJc0luUHJvZ3Jlc3ModHJ1ZSk7XG4gICAgICAgIHRoaXMucGxheWVyU2lnbmF0dXJlID0gbWVzc2FnZS5wbGF5ZXIuc2lnbmF0dXJlO1xuICAgICAgICB0aGlzLmFsbG93ZWRQbGF5cyA9IG1lc3NhZ2UuYWxsb3dlZF9wbGF5cztcbiAgICAgICAgY29uc29sZS5sb2coJ3NldCBhbGxvd2VkIHBsYXlzJywgdGhpcy5hbGxvd2VkUGxheXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlLnBsYXllciwgbWVzc2FnZS5wbGF5ZXIuY2FyZHMsIG1lc3NhZ2Uuc3RhY2spO1xuICAgICAgICBpZihtZXNzYWdlLmlzX3N0YXJ0aW5nX3BsYXllcikge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiBcIkl0J3MgeW91ciB0dXJuXCIsIHN0YXR1czogJ2luZm8nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiBcIldhaXRpbmcgZm9yIG9wcG9uZW50XCIsIHN0YXR1czogJ2luZm8nIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVhbENhcmRzKG1lc3NhZ2UpLnRoZW4oKCkgPT4geyBjb25zb2xlLmxvZygnZGVhbHQgY2FyZHMnKX0pO1xuICAgIH1cbiAgICBpbmNvbWluZyhtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ2luaXRfZ2FtZScpIHtcbiAgICAgICAgICAgIHRoaXMuaW5jb21pbmdJbml0R2FtZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ2NoYXQnKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogbWVzc2FnZS5mcm9tIHx8ICdvdGhlcicsIHRleHQ6IG1lc3NhZ2UubWVzc2FnZSwgc3RhdHVzOiBtZXNzYWdlLnN0YXR1cyB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ21vdmVfY2FyZCcpIHtcbiAgICAgICAgICAgIHRoaXMuaW5jb21pbmdNb3ZlQ2FyZChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbmNvbWluZ01vdmVDYXJkKG1lc3NhZ2UpIHtcbiAgICAgICAgbGV0IGZyb20gPSBtZXNzYWdlLmZyb207XG4gICAgICAgIGxldCB0byA9IG1lc3NhZ2UudG87XG5cbiAgICAgICAgbGV0IGNhcmRzID0gbWVzc2FnZS5jYXJkcztcbiAgICAgICAgY29uc29sZS5sb2coJ2luY29taW5nIG1vdmUgY2FyZCcsIG1lc3NhZ2UsIGNhcmRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBsZXQgc3VpdCA9IGNhcmRzW2ldLnN1aXQ7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBjYXJkc1tpXS52YWx1ZTtcblxuICAgICAgICAgICAgaWYoZnJvbSA9PT0gJ2hhbmQnICYmIHRvID09PSAncGlsZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLm1vdmVDYXJkT250byhzdWl0LCB2YWx1ZSwgdGhpcy5jYXJkR3JvdXBzLnBpbGUsIChjYXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiB0aGlzLmNhcmRHcm91cHMucGlsZS5uZXdDYXJkUG9zaXRpb24oKSB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZnJvbSA9PT0gJ29wcG9uZW50c19oYW5kJyAmJiB0byA9PT0gJ3BpbGUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQucmVwbGFjZVByaXZhdGVDYXJkKFt7IHN1aXQ6IHN1aXQsIHZhbHVlOiB2YWx1ZSB9XSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQubW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMucGlsZSwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDIwLCByb3RhdGlvbnM6IDMsIHRvUG9zaXRpb246IHRoaXMuY2FyZEdyb3Vwcy5waWxlLm5ld0NhcmRQb3NpdGlvbigpIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihmcm9tID09PSAnc3RhY2snICYmIHRvID09PSAnaGFuZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2sucmVwbGFjZVByaXZhdGVDYXJkKFt7IHN1aXQ6IHN1aXQsIHZhbHVlOiB2YWx1ZSB9XSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLnN0YWNrLm1vdmVDYXJkT250byhzdWl0LCB2YWx1ZSwgdGhpcy5jYXJkR3JvdXBzLm15SGFuZCwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDIwLCByb3RhdGlvbnM6IDMsIHRvUG9zaXRpb246IHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQubmV3Q2FyZFBvc2l0aW9uKCkgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGZyb20gPT09ICdzdGFjaycgJiYgdG8gPT09ICdvcHBvbmVudHNfaGFuZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2subW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzSGFuZCwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDIwLCByb3RhdGlvbnM6IDMsIHRvUG9zaXRpb246IHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNIYW5kLm5ld0NhcmRQb3NpdGlvbigpIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihmcm9tID09PSAnc3RhY2snICYmIHRvID09PSAncGlsZScpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW92aW5nIGZyb20gc3RhY2sgdG8gcGlsZScsIHN1aXQsIHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5zdGFjay5yZXBsYWNlUHJpdmF0ZUNhcmQoW3sgc3VpdDogc3VpdCwgdmFsdWU6IHZhbHVlIH1dKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2subW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMucGlsZSwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDEwLCByb3RhdGlvbjogMCwgdG9Qb3NpdGlvbjogdGhpcy5jYXJkR3JvdXBzLnBpbGUubmV3Q2FyZFBvc2l0aW9uKCkgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGZyb20gPT09ICdwaWxlJyAmJiB0byA9PT0gJ2hhbmQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmluZyBmcm9tIHBpbGUgdG8gaGFuZCcsIHN1aXQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5tb3ZlQ2FyZE9udG8oc3VpdCwgdmFsdWUsIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQsIChjYXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiB0aGlzLmNhcmRHcm91cHMubXlIYW5kLm5ld0NhcmRQb3NpdGlvbigpIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGZyb20gPT09ICdwaWxlJyAmJiB0byA9PT0gJ29wcG9uZW50c19oYW5kJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3ZpbmcgZnJvbSBwaWxlIHRvIG9wcG9uZW50cyBoYW5kJywgc3VpdCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5waWxlLnJlcGxhY2VBbGxQdWJsaWNDYXJkcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLnBpbGUubW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzSGFuZCwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDIwLCByb3RhdGlvbnM6IDMsIHRvUG9zaXRpb246IHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNIYW5kLm5ld0NhcmRQb3NpdGlvbigpIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihmcm9tID09PSAncGlsZScgJiYgdG8gPT09ICdkaXNjYXJkZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmluZyBmcm9tIHBpbGUgdG8gZGlzY2FyZGVkJywgc3VpdCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5waWxlLnJlcGxhY2VBbGxQdWJsaWNDYXJkcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkR3JvdXBzLnBpbGUubW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMuZGlzY2FyZGVkLCAoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjYXJkLnNldE1vdmUoeyBzdGVwczogMjAsIHJvdGF0aW9uczogMywgdG9Qb3NpdGlvbjogdGhpcy5jYXJkR3JvdXBzLmRpc2NhcmRlZC5uZXdDYXJkUG9zaXRpb24oKSB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZnJvbSA9PT0gJ3B5cmFtaWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmluZyBmcm9tIHB5cmFtaWQgdG8gaGFuZCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHZhciByb3dJbmRleCA9IG1lc3NhZ2UucHlyYW1pZF9sb2NhdGlvbi5yb3dfaW5kZXg7XG4gICAgICAgICAgICAgICAgdmFyIGNhcmRJbmRleCA9IG1lc3NhZ2UucHlyYW1pZF9sb2NhdGlvbi5jYXJkX2luZGV4O1xuXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRTdGFjayA9IHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuY2FyZHNbcm93SW5kZXhdW2NhcmRJbmRleF07XG5cbiAgICAgICAgICAgICAgICBpZihjYXJkU3RhY2suY2FyZHNbMF0uc3VpdCA9PT0gJ2JhY2snKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmRTdGFjay5yZXBsYWNlUHJpdmF0ZUNhcmQobWVzc2FnZS5jYXJkcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYodG8gPT09ICdoYW5kJykge1xuICAgICAgICAgICAgICAgICAgICBjYXJkU3RhY2subW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMubXlIYW5kLCAoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZC5zZXRNb3ZlKHsgc3RlcHM6IDIwLCByb3RhdGlvbnM6IDMsIHRvUG9zaXRpb246IHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQubmV3Q2FyZFBvc2l0aW9uKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHRvID09PSAncGlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZFN0YWNrLm1vdmVDYXJkT250byhzdWl0LCB2YWx1ZSwgdGhpcy5jYXJkR3JvdXBzLnBpbGUsIChjYXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLnNldE1vdmUoeyBzdGVwczogMjAsIHJvdGF0aW9uczogMywgdG9Qb3NpdGlvbjogdGhpcy5jYXJkR3JvdXBzLnBpbGUubmV3Q2FyZFBvc2l0aW9uKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihmcm9tID09PSAnb3Bwb25lbnRzX3B5cmFtaWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmluZyBmcm9tIG9wcG9uZW50c19weXJhbWlkIHRvIG9wcG9uZW50c19oYW5kJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgdmFyIHJvd0luZGV4ID0gbWVzc2FnZS5weXJhbWlkX2xvY2F0aW9uLnJvd19pbmRleDtcbiAgICAgICAgICAgICAgICB2YXIgY2FyZEluZGV4ID0gbWVzc2FnZS5weXJhbWlkX2xvY2F0aW9uLmNhcmRfaW5kZXg7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FyZFN0YWNrID0gdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c1B5cmFtaWQuY2FyZHNbcm93SW5kZXhdW2NhcmRJbmRleF07XG5cbiAgICAgICAgICAgICAgICBpZih0byA9PT0gJ29wcG9uZW50c19oYW5kJykge1xuICAgICAgICAgICAgICAgICAgICBjYXJkU3RhY2subW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzSGFuZCwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzSGFuZC5uZXdDYXJkUG9zaXRpb24oKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodG8gPT09ICdwaWxlJykge1xuICAgICAgICAgICAgICAgICAgICBjYXJkU3RhY2subW92ZUNhcmRPbnRvKHN1aXQsIHZhbHVlLCB0aGlzLmNhcmRHcm91cHMucGlsZSwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmQuc2V0TW92ZSh7IHN0ZXBzOiAyMCwgcm90YXRpb25zOiAzLCB0b1Bvc2l0aW9uOiB0aGlzLmNhcmRHcm91cHMucGlsZS5uZXdDYXJkUG9zaXRpb24oKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5jYXJkR3JvdXBzLnBpbGUuY2FyZHMubWFwKChjYXJkKSA9PiB7IGNhcmQuaGFzTW92ZSgpIH0pLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuYUNhcmRJc01vdmluZygpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMuY2FyZEdyb3Vwcy5zdGFjay5jYXJkcy5tYXAoKGNhcmQpID0+IHsgY2FyZC5oYXNNb3ZlKCkgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hQ2FyZElzTW92aW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5jYXJkR3JvdXBzLmRpc2NhcmRlZC5jYXJkcy5tYXAoKGNhcmQpID0+IHsgY2FyZC5oYXNNb3ZlKCkgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hQ2FyZElzTW92aW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5jYXJkR3JvdXBzLm15SGFuZC5jYXJkcy5tYXAoKGNhcmQpID0+IHsgY2FyZC5oYXNNb3ZlKCkgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hQ2FyZElzTW92aW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQuY2FyZHMubWFwKChjYXJkKSA9PiB7IGNhcmQuaGFzTW92ZSgpIH0pLmxlbmd0aCkge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuYUNhcmRJc01vdmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWxsb3dlZFBsYXlzID0gbWVzc2FnZS5hbGxvd2VkX3BsYXlzO1xuICAgIH1cbiAgICAvKlxuICAgIGNvbW1hbmQ6IFwibW92ZV9jYXJkXCJcbmZyb206IFwiaGFuZFwiXG5oYW5kOiBPYmplY3RcbmNhcmRzOiBBcnJheVsyXVxuX19wcm90b19fOiBPYmplY3RcbnN1aXQ6IFwiaGVhcnRzXCJcbnRvOiBcInBpbGVcIlxudmFsdWU6IFwiM1wiXG5cblxudGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBwaWxlUG9zaXRpb24gPSB0aGlzLmNhcmRHcm91cHMucGlsZS5uZXdDYXJkUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmNhcmRHcm91cHMubXlIYW5kLm1vdmVIb3ZlcmVkT250byh0aGlzLmNhcmRHcm91cHMucGlsZSwgKGNhcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BpbGVwb3NpdGlvbicsIHBpbGVQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkLnNldE1vdmUoeyBzdGVwczogMjAsIHJvdGF0aW9uczogMywgdG9Qb3NpdGlvbjogcGlsZVBvc2l0aW9uIH0pXG4gICAgICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2FyZEdyb3VwcygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuY2FyZEdyb3Vwcy5waWxlLmNhcmRzLm1hcCgoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZC5oYXNNb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hQ2FyZElzTW92aW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuKi9cbiAgICBkZWFsQ2FyZHMobWVzc2FnZSkge1xuICAgICAgICBtZXNzYWdlLnN0YWNrLmNhcmRzLm1hcCgoY2FyZERhdGEpID0+IHsgdGhpcy5jYXJkR3JvdXBzLnN0YWNrLmFkZENhcmQoY2FyZERhdGEuc3VpdCwgY2FyZERhdGEudmFsdWUpIH0pO1xuICAgICAgICBtZXNzYWdlLnBsYXllci5jYXJkc19vbl9oYW5kLmNhcmRzLm1hcCgoY2FyZERhdGEpID0+IHsgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKGNhcmREYXRhLnN1aXQsIGNhcmREYXRhLnZhbHVlKSB9KTtcbiAgICAgICAgbWVzc2FnZS5vcHBvbmVudC5jYXJkc19vbl9oYW5kLmNhcmRzLm1hcCgoY2FyZERhdGEpID0+IHsgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQuYWRkQ2FyZChjYXJkRGF0YS5zdWl0LCBjYXJkRGF0YS52YWx1ZSkgfSk7XG5cbiAgICAgICAgbGV0IHBsYXllckNhcmRzT25UYWJsZSA9IG1lc3NhZ2UucGxheWVyLmNhcmRzX29uX3RhYmxlO1xuICAgICAgICBsZXQgb3Bwb25lbnRDYXJkc09uVGFibGUgPSBtZXNzYWdlLm9wcG9uZW50LmNhcmRzX29uX3RhYmxlO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IDQ7IHJvd0luZGV4ICs9IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjYXJkSW5kZXggPSAwOyBjYXJkSW5kZXggPD0gKDQgLSByb3dJbmRleCk7IGNhcmRJbmRleCArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBteUNhcmQgPSBwbGF5ZXJDYXJkc09uVGFibGUuY2FyZHNbcm93SW5kZXhdW2NhcmRJbmRleF0uY2FyZHNbMF07XG4gICAgICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENhcmQgPSBvcHBvbmVudENhcmRzT25UYWJsZS5jYXJkc1tyb3dJbmRleF1bY2FyZEluZGV4XS5jYXJkc1swXTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQocm93SW5kZXgsIGNhcmRJbmRleCwgbXlDYXJkLnN1aXQsIG15Q2FyZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQocm93SW5kZXgsIGNhcmRJbmRleCwgb3Bwb25lbnRDYXJkLnN1aXQsIG9wcG9uZW50Q2FyZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmRyYXdDYXJkR3JvdXBzKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgIC8vICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMTU7IGkgKz0gMSkge1xuICAgICAgICAgLy8gICAgICAgdGhpcy5jYXJkR3JvdXBzLnN0YWNrLm1vdmVUb3BDYXJkT250byh0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLCAoY2FyZCkgPT4ge1xuICAgICAgICAgLy8gICAgICAgICAgICBjYXJkLnNldE1vdmUoeyBzdGVwczogMjAsIHJvdGF0aW9uczogMCwgdG9Qb3NpdGlvbjogdGhpcy5jYXJkR3JvdXBzLm15UHlyYW1pZC5uZXdDYXJkUG9zaXRpb24oKSB9KTtcbiAgICAgICAgIC8vICAgICAgIH0pO1xuICAgICAgICAgLy8gICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4geyByZXR1cm4gfSk7XG4gICAgfVxuICAgIGRyYXdDYXJkR3JvdXBzKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuc29ydEJ5KCd2YWx1ZScpO1xuXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5kaXNjYXJkZWQuZHJhdygpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmRyYXcoKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQuZHJhdygpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmRyYXcoKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c1B5cmFtaWQuZHJhdygpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2suZHJhdygpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5kcmF3KCk7XG4gICAgfVxuICAgIGFDYXJkSXNNb3ZpbmcoKSB7XG4gICAgICAgIHRoaXMuZHJhd0NhcmRHcm91cHMoKTtcbiAgICAgICAgbGV0IGNhcmRHcm91cHMgPSBbJ215SGFuZCcsICdvcHBvbmVudHNIYW5kJywgJ3N0YWNrJywgJ3BpbGUnLCAnZGlzY2FyZGVkJ107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXJkR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICB2YXIgY2FyZEdyb3VwID0gY2FyZEdyb3Vwc1tpXTtcbiAgICAgICAgICAgIGlmKHRoaXMuY2FyZEdyb3Vwc1tjYXJkR3JvdXBdLmNhcmRzLm1hcCgoY2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhcmQuaGFzTW92ZSgpXG4gICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hQ2FyZElzTW92aW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG4gICAgYW5pbWF0ZUFDYXJkKCkge1xuICAgICAgICAvKlxuICAgICAgICB2YXIgY2FyZCA9IG5ldyBDYXJkKHtcbiAgICAgICAgICAgIHN1aXQ6ICdjbHVicycsXG4gICAgICAgICAgICB2YWx1ZTogJ3F1ZWVuJyxcbiAgICAgICAgICAgIGltYWdlOiB0aGlzLmNhcmRHZW5lcmF0b3IuY2FyZCgnY2x1YnMnLCAncXVlZW4nKSxcbiAgICAgICAgICAgIHNjZW5lOiB0aGlzLnNjZW5lLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5lbnN1cmVDYXJkKCdjbHVicycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmVuc3VyZUNhcmQoJ3NwYWRlcycsICdraW5nJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuZW5zdXJlQ2FyZCgnZGlhbW9uZHMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5lbnN1cmVDYXJkKCdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmVuc3VyZUNhcmQoJ2RpYW1vbmRzJywgJzQnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5lbnN1cmVDYXJkKCdoZWFydHMnLCAnamFjaycpO1xuXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuYWRkQ2FyZCgnY2x1YnMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKCdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmFkZENhcmQoJ2RpYW1vbmRzJywgJ3F1ZWVuJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuYWRkQ2FyZCgnc3BhZGVzJywgJ2tpbmcnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKCdkaWFtb25kcycsICc0Jyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuYWRkQ2FyZCgnaGVhcnRzJywgJ2phY2snKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKCdjbHVicycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmFkZENhcmQoJ3NwYWRlcycsICdraW5nJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuYWRkQ2FyZCgnZGlhbW9uZHMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKCdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlIYW5kLmFkZENhcmQoJ2RpYW1vbmRzJywgJzQnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15SGFuZC5hZGRDYXJkKCdoZWFydHMnLCAnamFjaycpO1xuXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNIYW5kLmFkZENhcmQoJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNIYW5kLmFkZENhcmQoJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNIYW5kLmFkZENhcmQoJ2JhY2snLCAncmVkJyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNhcmRHcm91cHMuc3RhY2suYWRkQ2FyZCgnYmFjaycsICdyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1OyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5kaXNjYXJkZWQuYWRkQ2FyZCgnYmFjaycsICdyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5lbnN1cmVDYXJkKCdjbHVicycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5lbnN1cmVDYXJkKCdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5lbnN1cmVDYXJkKCdkaWFtb25kcycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5lbnN1cmVDYXJkKCdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZS5lbnN1cmVDYXJkKCdkaWFtb25kcycsICc0Jyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5waWxlLmVuc3VyZUNhcmQoJ2hlYXJ0cycsICdqYWNrJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5waWxlLmVuc3VyZUNhcmQoJ2RpYW1vbmRzJywgJzgnKTtcblxuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQoMSwgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCgxLCAnYmFjaycsICdyZWQnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15UHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQoMSwgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCgxLCAnYmFjaycsICdyZWQnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15UHlyYW1pZC5hZGRDYXJkKDIsICdkaWFtb25kcycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQoMiwgJ3NwYWRlcycsICdraW5nJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCgyLCAnZGlhbW9uZHMnLCAnNCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQoMiwgJ2hlYXJ0cycsICdqYWNrJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCgzLCAnYmFjaycsICdyZWQnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15UHlyYW1pZC5hZGRDYXJkKDMsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMubXlQeXJhbWlkLmFkZENhcmQoMywgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCg0LCAnY2x1YnMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm15UHlyYW1pZC5hZGRDYXJkKDQsICdoZWFydHMnLCAnYWNlJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQuYWRkQ2FyZCg1LCAnYmFjaycsICdyZWQnKTtcblxuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDEsICdiYWNrJywgJ3JlZCcpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDIsICdkaWFtb25kcycsICdxdWVlbicpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDIsICdzcGFkZXMnLCAna2luZycpO1xuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZC5hZGRDYXJkKDIsICdkaWFtb25kcycsICc0Jyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoMiwgJ2hlYXJ0cycsICdqYWNrJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoMywgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoMywgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoMywgJ2JhY2snLCAncmVkJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoNCwgJ2NsdWJzJywgJ3F1ZWVuJyk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5vcHBvbmVudHNQeXJhbWlkLmFkZENhcmQoNCwgJ2hlYXJ0cycsICdhY2UnKTtcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c1B5cmFtaWQuYWRkQ2FyZCg1LCAnYmFjaycsICdyZWQnKTtcblxuICAgICAgICBjYXJkLmRyYXcoeyB4OiAzMDAsIHk6IDUwMCwgcmVzaXplcjogMC42IH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydEFuaW1hdGluZyhjYXJkLCAzMDApO1xuICAgICAgICAqL1xuICAgIH1cbiAgICBzdGFydEFuaW1hdGluZyhjYXJkLCB4KSB7XG4gICAgICAgIHRoaXMuZHJhd0NhcmRHcm91cHMoKTtcbiAgIC8vICAgICBjYXJkLmRyYXcoeyB4OiB4LCB5OiA1MDAsIHJlc2l6ZXI6IDAuNiwgcm90YXRpb25GdXp6eW5lc3M6IDAgfSk7XG4gICAgICAgIGlmKHggPiA2NTApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuc3RhcnRBbmltYXRpbmcoY2FyZCwgeCArIDUpKTtcbiAgICB9XG4gICAgc3RhcnQoKSB7XG4gICAgICAgIC8qXG4gICAgICAgIHRoaXMubXlIYW5kLmFkZENhcmQoJ2NsdWJzJywgJ3F1ZWVuJyk7XG4gICAgICAgIHRoaXMubXlIYW5kLmFkZENhcmQoJ3NwYWRlcycsICdraW5nJyk7XG4gICAgICAgIHRoaXMubXlIYW5kLmFkZENhcmQoJ2RpYW1vbmRzJywgJ3F1ZWVuJyk7XG4gICAgICAgIHRoaXMubXlIYW5kLmFkZENhcmQoJ3NwYWRlcycsICdraW5nJyk7XG4gICAgICAgIHRoaXMubXlIYW5kLmFkZENhcmQoJ2RpYW1vbmRzJywgJzQnKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnaGVhcnRzJywgJ2phY2snKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnY2x1YnMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnc3BhZGVzJywgJ2tpbmcnKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnZGlhbW9uZHMnLCAncXVlZW4nKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnc3BhZGVzJywgJ2tpbmcnKTtcbiAgICAgICAgdGhpcy5teUhhbmQuYWRkQ2FyZCgnZGlhbW9uZHMnLCAnNCcpO1xuICAgICAgICB0aGlzLm15SGFuZC5hZGRDYXJkKCdoZWFydHMnLCAnamFjaycpO1xuICAgICAgICAqL1xuICAgICAgICB0aGlzLmRyYXdDYXJkR3JvdXBzKCk7XG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQuc29ydEJ5KCdzdWl0Jyk7XG4gICAgICAgIC8vICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAxMDAsIDIwMDAsIDEwMDApOyB0aGlzLm15SGFuZC5kcmF3KCkgfSwgMTUwMCk7XG5cbiAgICAgICAgdmFyIHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLSA1MDtcbiAgICAgICAgdGhpcy5hcmVhcy5wdXNoKCB0aGlzLmNhcmRzLmNhcmQoJ2NsdWJzJywgJ3F1ZWVuJykuZHJhdyh7IHg6IDQwMCwgeTogeSwgc2l6ZTogMC41LCByb3RhdGlvbjogMCwgcm90YXRpb25GdXp6eW5lc3M6IDMsIGNlbnRlckZ1enp5bmVzczogMC4wNSB9KSApO1xuICAgICAgICB0aGlzLmFyZWFzLnB1c2goIHRoaXMuY2FyZHMuY2FyZCgnc3BhZGVzJywgJ2tpbmcnKS5kcmF3KHsgeDogNDcwLCB5OiB5LCBzaXplOiAwLjUsIHJvdGF0aW9uOiAwLCByb3RhdGlvbkZ1enp5bmVzczogMywgY2VudGVyRnV6enluZXNzOiAwLjA1IH0pICk7XG4gICAgICAgIHRoaXMuYXJlYXMucHVzaCggdGhpcy5jYXJkcy5jYXJkKCdkaWFtb25kcycsICdxdWVlbicpLmRyYXcoeyB4OiA1NDAsIHk6IHksIHNpemU6IDAuNSwgcm90YXRpb246IDAsIHJvdGF0aW9uRnV6enluZXNzOiAzLCBjZW50ZXJGdXp6eW5lc3M6IDAuMDUgfSkgKTtcbiAgICAgICAgdGhpcy5hcmVhcy5wdXNoKCB0aGlzLmNhcmRzLmNhcmQoJ3NwYWRlcycsICdraW5nJykuZHJhdyh7IHg6IDYxMCwgeTogeSwgc2l6ZTogMC41LCByb3RhdGlvbjogMCwgcm90YXRpb25GdXp6eW5lc3M6IDMsIGNlbnRlckZ1enp5bmVzczogMC4wNSB9KSApO1xuICAgICAgICB0aGlzLmFyZWFzLnB1c2goIHRoaXMuY2FyZHMuY2FyZCgnZGlhbW9uZHMnLCAnNCcpLmRyYXcoeyB4OiA2ODAsIHk6IHksIHNpemU6IDAuNSwgcm90YXRpb246IDAsIHJvdGF0aW9uRnV6enluZXNzOiAzLCBjZW50ZXJGdXp6eW5lc3M6IDAuMDUgfSkgKTtcblxuICAgICAgICB0aGlzLmRyYWdnYWJsZUluZGV4ID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnZ2VkSW5kZXggPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldEN1cnNvckxvY2F0aW9uKGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0aGlzLmRyYWdnZWRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgICAgIHk6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgICAgIHVzZUFjdHVhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3KHRoaXMuZHJhZ2dlZEluZGV4KTtcbiAgICAgICAgICAgICAgICB0aGlzLmFyZWFzW3RoaXMuZHJhZ2dlZEluZGV4XS5yZWRyYXdPdXRsaW5lKHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcmVhc1t0aGlzLmRyYWdnZWRJbmRleF0ucmVkcmF3KHBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIEZJTkRDQVJEOlxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmFyZWFzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuYXJlYXNbaV0uaXNIb3Zlcihwb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dhYmxlSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53cml0ZU1lc3NhZ2UoJ092ZXIgJyArIHRoaXMuYXJlYXNbaV0uc3VpdCArICcgJyArIHRoaXMuYXJlYXNbaV0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3KGksICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJlYSA9IHRoaXMuYXJlYXNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8PSA1OyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEucmVkcmF3T3V0bGluZSh7IHk6IGFyZWEuZHJhd1BhcmFtcy55IC0gMjAgKiBqLCB1c2VBY3R1YWwgOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5yZWRyYXcoeyB5OiBhcmVhLmRyYXdQYXJhbXMueSAtIDIwICogaiwgdXNlQWN0dWFsIDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhayBGSU5EQ0FSRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnYWJsZUluZGV4ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuYXJlYXMubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlTWVzc2FnZSgnLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRDdXJzb3JMb2NhdGlvbihlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3VzZSBpcyBkb3duJyk7XG4gICAgICAgICAgICBpZih0aGlzLmRyYWdnYWJsZUluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2VkSW5kZXggPSB0aGlzLmRyYWdnYWJsZUluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZEluZGV4ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRyYXcoaG92ZXJlZEluZGV4ID0gLTEwMCwgY2FsbGJhY2sgPSAoKSA9PiB7fSkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMTAwLCAyMDAwLCAxMDAwKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZWFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihpID09PSBob3ZlcmVkSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcmVhc1tpXS5yZWRyYXcoeyB1c2VBY3R1YWw6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0Q3Vyc29yTG9jYXRpb24oZSkge1xuICAgICAgICB2YXIgYm91bmRzID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBlLmNsaWVudFggLSBib3VuZHMubGVmdCxcbiAgICAgICAgICAgIHk6IGUuY2xpZW50WSAtIGJvdW5kcy50b3AsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHdyaXRlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCA1MDAsIDEwMCk7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMThwdCBDYWxpYnJpJzsgXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG1lc3NhZ2UsIDEwLCA1NSk7XG5cbiAgICB9XG5cblxuXG5cblxuXG5cbiAgICBzZXR1cENhcmRHcm91cHMoKSB7XG4gICAgICAgIHRoaXMuc2V0dXBDYXJkR3JvdXBNeUhhbmQoKTtcbiAgICAgICAgdGhpcy5zZXR1cE15UHlyYW1pZCgpO1xuICAgICAgICB0aGlzLnNldHVwQ2FyZEdyb3VwT3Bwb25lbnRzSGFuZCgpO1xuICAgICAgICB0aGlzLnNldHVwT3Bwb25lbnRzUHlyYW1pZCgpO1xuICAgICAgICB0aGlzLnNldHVwQ2FyZEdyb3VwU3RhY2soKTtcbiAgICAgICAgdGhpcy5zZXR1cENhcmRHcm91cFBpbGUoKTtcbiAgICAgICAgdGhpcy5zZXR1cENhcmRHcm91cERpc2NhcmRlZCgpO1xuICAgIH1cblxuICAgIC8vIEhhbmRzXG4gICAgaGFuZENvbW1vblBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjZW5lOiB0aGlzLnNjZW5lLFxuICAgICAgICAgICAgY2FyZEdlbmVyYXRvcjogdGhpcy5jYXJkR2VuZXJhdG9yLFxuICAgICAgICAgICAgZ3JvdXBBcmVhOiB7XG4gICAgICAgICAgICAgICAgbGVmdFg6IDIwLFxuICAgICAgICAgICAgICAgIGNlbnRlclk6IHRoaXMuY2FudmFzLmhlaWdodCAqIDAuOTUsXG4gICAgICAgICAgICAgICAgbWF4V2lkdGg6IHRoaXMuY2FudmFzLndpZHRoIC8gMyxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodCAvIDMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZHJhd1BhcmFtczoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0MDAsXG4gICAgICAgICAgICAgICAgYmFzZVJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uRnV6enluZXNzOiAzLFxuICAgICAgICAgICAgICAgIGNlbnRlckZ1enp5bmVzczogMC4wNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHNldHVwQ2FyZEdyb3VwTXlIYW5kKCkge1xuICAgICAgICBsZXQgcGFyYW1zID0gdGhpcy5oYW5kQ29tbW9uUGFyYW1zKCk7XG4gICAgICAgIHBhcmFtcy5ncm91cEFyZWEuY2VudGVyWSA9IHRoaXMuY2FudmFzLmhlaWdodCAqIDAuOTUsXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teUhhbmQgPSBuZXcgSGFuZChwYXJhbXMpO1xuICAgIH1cbiAgICBzZXR1cENhcmRHcm91cE9wcG9uZW50c0hhbmQoKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLmhhbmRDb21tb25QYXJhbXMoKTtcbiAgICAgICAgcGFyYW1zLmdyb3VwQXJlYS5jZW50ZXJZID0gdGhpcy5jYW52YXMuaGVpZ2h0ICogMC4wNSxcbiAgICAgICAgdGhpcy5jYXJkR3JvdXBzLm9wcG9uZW50c0hhbmQgPSBuZXcgSGFuZChwYXJhbXMpO1xuICAgIH1cbiAgICAvLyBTdGFja3NcbiAgICBzdGFja0NsYXNzQ29tbW9uUGFyYW1zKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2NlbmU6IHRoaXMuc2NlbmUsXG4gICAgICAgICAgICBjYXJkR2VuZXJhdG9yOiB0aGlzLmNhcmRHZW5lcmF0b3IsXG4gICAgICAgICAgICBncm91cEFyZWE6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjZW50ZXJZOiB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyLFxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiAyMDAsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNhbnZhcy5oZWlnaHQgLyA0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRyYXdQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogMzUwLFxuICAgICAgICAgICAgICAgIGJhc2VSb3RhdGlvbjogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHNldHVwQ2FyZEdyb3VwU3RhY2soKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLnN0YWNrQ2xhc3NDb21tb25QYXJhbXMoKTtcbiAgICAgICAgcGFyYW1zLmdyb3VwQXJlYS5sZWZ0WCA9IHRoaXMuY2FudmFzLndpZHRoICogMC41O1xuICAgICAgICBwYXJhbXMuZHJhd1BhcmFtcy5yb3RhdGlvbkZ1enp5bmVzcyA9IDg7XG4gICAgICAgIHBhcmFtcy5kcmF3UGFyYW1zLmNlbnRlckZ1enp5bmVzcyA9IC4xO1xuXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5zdGFjayA9IG5ldyBTdGFjayhwYXJhbXMpO1xuICAgIH1cbiAgICBzZXR1cENhcmRHcm91cFBpbGUoKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLnN0YWNrQ2xhc3NDb21tb25QYXJhbXMoKTtcbiAgICAgICAgcGFyYW1zLmdyb3VwQXJlYS5sZWZ0WCA9IHRoaXMuY2FudmFzLndpZHRoICogMC4zO1xuICAgICAgICBwYXJhbXMuZHJhd1BhcmFtcy5yb3RhdGlvbkZ1enp5bmVzcyA9IDEyO1xuICAgICAgICBwYXJhbXMuZHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3MgPSAuMTtcblxuICAgICAgICB0aGlzLmNhcmRHcm91cHMucGlsZSA9IG5ldyBTdGFjayhwYXJhbXMpO1xuICAgIH1cbiAgICBzZXR1cENhcmRHcm91cERpc2NhcmRlZCgpIHtcbiAgICAgICAgbGV0IHBhcmFtcyA9IHRoaXMuc3RhY2tDbGFzc0NvbW1vblBhcmFtcygpO1xuICAgICAgICBwYXJhbXMuZ3JvdXBBcmVhLmxlZnRYID0gdGhpcy5jYW52YXMud2lkdGggKiAwLjA4O1xuICAgICAgICBwYXJhbXMuZHJhd1BhcmFtcy5yb3RhdGlvbkZ1enp5bmVzcyA9IDQ1O1xuICAgICAgICBwYXJhbXMuZHJhd1BhcmFtcy5jZW50ZXJGdXp6eW5lc3MgPSAuNTtcblxuICAgICAgICB0aGlzLmNhcmRHcm91cHMuZGlzY2FyZGVkID0gbmV3IFN0YWNrKHBhcmFtcyk7XG4gICAgfVxuICAgIC8vIFB5cmFtaWRzXG4gICAgcHlyYW1pZENvbW1vblBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjZW5lOiB0aGlzLnNjZW5lLFxuICAgICAgICAgICAgY2FyZEdlbmVyYXRvcjogdGhpcy5jYXJkR2VuZXJhdG9yLFxuICAgICAgICAgICAgZ3JvdXBBcmVhOiB7XG4gICAgICAgICAgICAgICAgY2VudGVyWDogdGhpcy5jYW52YXMud2lkdGggKiAwLjcsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNhbnZhcy5oZWlnaHQgKiAwLjQsXG4gICAgICAgICAgICAgICAgbWF4V2lkdGg6IDEwMDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZHJhd1BhcmFtczoge1xuICAgICAgICAgICAgICAgIHJvdGF0aW9uRnV6enluZXNzOiAzLFxuICAgICAgICAgICAgICAgIGNlbnRlckZ1enp5bmVzczogMC4wNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHNldHVwTXlQeXJhbWlkKCkge1xuICAgICAgICBsZXQgcGFyYW1zID0gdGhpcy5weXJhbWlkQ29tbW9uUGFyYW1zKCk7XG4gICAgICAgIHBhcmFtcy5ncm91cEFyZWEuZGlyZWN0aW9uID0gJ25vcm1hbCc7XG4gICAgICAgIHBhcmFtcy5ncm91cEFyZWEuYmFzZVJvd0NlbnRlclkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgKiAwLjk1O1xuXG4gICAgICAgIHRoaXMuY2FyZEdyb3Vwcy5teVB5cmFtaWQgPSBuZXcgUHlyYW1pZChwYXJhbXMpO1xuICAgIH1cbiAgICBzZXR1cE9wcG9uZW50c1B5cmFtaWQoKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLnB5cmFtaWRDb21tb25QYXJhbXMoKTtcbiAgICAgICAgcGFyYW1zLmdyb3VwQXJlYS5kaXJlY3Rpb24gPSAnaW52ZXJ0ZWQnO1xuICAgICAgICBwYXJhbXMuZ3JvdXBBcmVhLmJhc2VSb3dDZW50ZXJZID0gdGhpcy5jYW52YXMuaGVpZ2h0ICogMC4wNTtcblxuICAgICAgICB0aGlzLmNhcmRHcm91cHMub3Bwb25lbnRzUHlyYW1pZCA9IG5ldyBQeXJhbWlkKHBhcmFtcyk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IEZpbm5lLCB0ZW1wbGF0ZTogdGVtcGxhdGVNYXJrdXAgfTtcbiJdfQ==;
define('lib/misc/area-handler',['exports'], function (exports) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var AreaHandler = (function () {
        function AreaHandler(params) {
            _classCallCheck(this, AreaHandler);

            this.suit = params.suit;
            this.value = params.value;
            this.corners = params.corners;
            this.card = params.card;
            this.drawParams = params.drawParams;
        }

        _createClass(AreaHandler, [{
            key: 'isHover',
            value: function isHover(position) {
                var topLeft = this.corners[0];
                var bottomLeft = this.corners[1];
                var bottomRight = this.corners[2];
                var topRight = this.corners[3];

                var leftDeltaX = bottomLeft.x - topLeft.x;
                var leftDeltaY = bottomLeft.y - topLeft.y;
                var topDeltaX = topRight.x - topLeft.x;
                var topDeltaY = topRight.y - topLeft.y;

                if ((position.x - topLeft.x) * leftDeltaX + (position.y - topLeft.y) * leftDeltaY < 0.0) {
                    return false;
                }
                if ((position.x - bottomLeft.x) * leftDeltaX + (position.y - bottomLeft.y) * leftDeltaY > 0.0) {
                    return false;
                }
                if ((position.x - topLeft.x) * topDeltaX + (position.y - topLeft.y) * topDeltaY < 0.0) {
                    return false;
                }
                if ((position.x - topRight.x) * topDeltaX + (position.y - topRight.y) * topDeltaY > 0.0) {
                    return false;
                }

                return true;

                /*
                        var topDelta = (topRight.y - topLeft.y) / (topRight.x - topLeft.x);
                
                        topM = topLeft.y - topDelta * topLeft.x;
                        console.log(position.x, Math.round(position.x * topDelta), Math.round(topM), this.corners);*/
            }
        }, {
            key: 'redraw',
            value: function redraw() {
                var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var actualParams = this.mixParams(params);
                this.corners = this.card.draw(actualParams).corners;
            }
        }, {
            key: 'redrawOutline',
            value: function redrawOutline() {
                var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var actualParams = this.mixParams(params);
                var radius = this.card.image.width * actualParams.size / 10;

                this.card.scene.roundRectCorners(this.corners, radius, { lineWidth: 10, strike: false, shadow: { blur: 10, color: '#f0f' } });
            }
        }, {
            key: 'mixParams',
            value: function mixParams(params) {
                var useActual = params.useActual ? params.useActual : false;
                var actualParams = {
                    x: typeof params.x === 'undefined' ? useActual ? this.drawParams.actual.x : this.drawParams.x : params.x,
                    y: typeof params.y === 'undefined' ? useActual ? this.drawParams.actual.y : this.drawParams.y : params.y,
                    size: typeof params.size === 'undefined' ? this.drawParams.size : params.size, // is always actual
                    centerFuzzyness: typeof params.centerFuzzyness === 'undefined' ? useActual ? 0 : this.drawParams.centerFuzzyness : params.centerFuzzyness,
                    rotation: typeof params.rotation === 'undefined' ? useActual ? this.drawParams.actual.rotation : this.drawParams.rotation : params.rotation,
                    rotationFuzzyness: typeof params.rotationFuzzyness === 'undefined' ? useActual ? 0 : this.drawParams.rotationFuzzyness : params.rotationFuzzyness
                };
                return actualParams;
            }
        }]);

        return AreaHandler;
    })();

    exports.AreaHandler = AreaHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvbGliL21pc2MvYXJlYS1oYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O1FBQWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzFCLGdCQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDOUIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO1NBQ3ZDOztxQkFQUSxXQUFXOzttQkFRYixpQkFBQyxRQUFRLEVBQUU7QUFDZCxvQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixvQkFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQyxvQkFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxvQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFL0Isb0JBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMxQyxvQkFBSSxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzFDLG9CQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdkMsb0JBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQzs7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QUFDL0UsbUNBQWUsRUFBRyxPQUFPLE1BQU0sQ0FBQyxlQUFlLEtBQUssV0FBVyxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsQUFBQztBQUMzSSw0QkFBUSxFQUFHLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxBQUFDO0FBQzdJLHFDQUFpQixFQUFHLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixLQUFLLFdBQVcsR0FBRyxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixBQUFDO2lCQUN0SixDQUFDO0FBQ0YsdUJBQU8sWUFBWSxDQUFDO2FBQ3ZCOzs7ZUFyRFEsV0FBVyIsImZpbGUiOiJnc3JjL2xpYi9taXNjL2FyZWEtaGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBBcmVhSGFuZGxlciB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuc3VpdCA9IHBhcmFtcy5zdWl0O1xuICAgICAgICB0aGlzLnZhbHVlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICB0aGlzLmNvcm5lcnMgPSBwYXJhbXMuY29ybmVycztcbiAgICAgICAgdGhpcy5jYXJkID0gcGFyYW1zLmNhcmQ7XG4gICAgICAgIHRoaXMuZHJhd1BhcmFtcyA9IHBhcmFtcy5kcmF3UGFyYW1zO1xuICAgIH1cbiAgICBpc0hvdmVyKHBvc2l0aW9uKSB7XG4gICAgICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5jb3JuZXJzWzBdO1xuICAgICAgICB2YXIgYm90dG9tTGVmdCA9IHRoaXMuY29ybmVyc1sxXTtcbiAgICAgICAgdmFyIGJvdHRvbVJpZ2h0ID0gdGhpcy5jb3JuZXJzWzJdO1xuICAgICAgICB2YXIgdG9wUmlnaHQgPSB0aGlzLmNvcm5lcnNbM107XG5cbiAgICAgICAgdmFyIGxlZnREZWx0YVggPSBib3R0b21MZWZ0LnggLSB0b3BMZWZ0Lng7XG4gICAgICAgIHZhciBsZWZ0RGVsdGFZID0gYm90dG9tTGVmdC55IC0gdG9wTGVmdC55O1xuICAgICAgICB2YXIgdG9wRGVsdGFYID0gdG9wUmlnaHQueCAtIHRvcExlZnQueDtcbiAgICAgICAgdmFyIHRvcERlbHRhWSA9IHRvcFJpZ2h0LnkgLSB0b3BMZWZ0Lnk7XG5cbiAgICAgICAgaWYoKHBvc2l0aW9uLnggLSB0b3BMZWZ0LngpICAgICogbGVmdERlbHRhWCArIChwb3NpdGlvbi55IC0gdG9wTGVmdC55KSAgICAqIGxlZnREZWx0YVkgPCAwLjApIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgaWYoKHBvc2l0aW9uLnggLSBib3R0b21MZWZ0LngpICogbGVmdERlbHRhWCArIChwb3NpdGlvbi55IC0gYm90dG9tTGVmdC55KSAqIGxlZnREZWx0YVkgPiAwLjApIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgaWYoKHBvc2l0aW9uLnggLSB0b3BMZWZ0LngpICAgICogdG9wRGVsdGFYICArIChwb3NpdGlvbi55IC0gdG9wTGVmdC55KSAgICAqIHRvcERlbHRhWSAgPCAwLjApIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgaWYoKHBvc2l0aW9uLnggLSB0b3BSaWdodC54KSAgICogdG9wRGVsdGFYICArIChwb3NpdGlvbi55IC0gdG9wUmlnaHQueSkgICAqIHRvcERlbHRhWSAgPiAwLjApIHsgcmV0dXJuIGZhbHNlIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuLypcbiAgICAgICAgdmFyIHRvcERlbHRhID0gKHRvcFJpZ2h0LnkgLSB0b3BMZWZ0LnkpIC8gKHRvcFJpZ2h0LnggLSB0b3BMZWZ0LngpO1xuXG4gICAgICAgIHRvcE0gPSB0b3BMZWZ0LnkgLSB0b3BEZWx0YSAqIHRvcExlZnQueDtcbiAgICAgICAgY29uc29sZS5sb2cocG9zaXRpb24ueCwgTWF0aC5yb3VuZChwb3NpdGlvbi54ICogdG9wRGVsdGEpLCBNYXRoLnJvdW5kKHRvcE0pLCB0aGlzLmNvcm5lcnMpOyovXG4gICAgfVxuICAgIHJlZHJhdyhwYXJhbXMgPSB7fSkge1xuICAgICAgICB2YXIgYWN0dWFsUGFyYW1zID0gdGhpcy5taXhQYXJhbXMocGFyYW1zKTtcbiAgICAgICAgdGhpcy5jb3JuZXJzID0gdGhpcy5jYXJkLmRyYXcoYWN0dWFsUGFyYW1zKS5jb3JuZXJzO1xuICAgIH1cbiAgICByZWRyYXdPdXRsaW5lKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIHZhciBhY3R1YWxQYXJhbXMgPSB0aGlzLm1peFBhcmFtcyhwYXJhbXMpO1xuICAgICAgICB2YXIgcmFkaXVzID0gdGhpcy5jYXJkLmltYWdlLndpZHRoICogYWN0dWFsUGFyYW1zLnNpemUgLyAxMDtcblxuICAgICAgICB0aGlzLmNhcmQuc2NlbmUucm91bmRSZWN0Q29ybmVycyh0aGlzLmNvcm5lcnMsIHJhZGl1cywgeyBsaW5lV2lkdGg6IDEwLCBzdHJpa2U6IGZhbHNlLCBzaGFkb3c6IHsgYmx1cjogMTAsIGNvbG9yOiAnI2YwZicgfX0pO1xuICAgIH1cbiAgICBtaXhQYXJhbXMocGFyYW1zKSB7XG4gICAgICAgIHZhciB1c2VBY3R1YWwgPSBwYXJhbXMudXNlQWN0dWFsID8gcGFyYW1zLnVzZUFjdHVhbCA6IGZhbHNlO1xuICAgICAgICB2YXIgYWN0dWFsUGFyYW1zID0ge1xuICAgICAgICAgICAgeDogKHR5cGVvZiBwYXJhbXMueCA9PT0gJ3VuZGVmaW5lZCcgPyB1c2VBY3R1YWwgPyB0aGlzLmRyYXdQYXJhbXMuYWN0dWFsLnggOiB0aGlzLmRyYXdQYXJhbXMueCA6IHBhcmFtcy54KSxcbiAgICAgICAgICAgIHk6ICh0eXBlb2YgcGFyYW1zLnkgPT09ICd1bmRlZmluZWQnID8gdXNlQWN0dWFsID8gdGhpcy5kcmF3UGFyYW1zLmFjdHVhbC55IDogIHRoaXMuZHJhd1BhcmFtcy55IDogcGFyYW1zLnkpLFxuICAgICAgICAgICAgc2l6ZTogKHR5cGVvZiBwYXJhbXMuc2l6ZSA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLmRyYXdQYXJhbXMuc2l6ZSA6IHBhcmFtcy5zaXplKSwgIC8vIGlzIGFsd2F5cyBhY3R1YWxcbiAgICAgICAgICAgIGNlbnRlckZ1enp5bmVzczogKHR5cGVvZiBwYXJhbXMuY2VudGVyRnV6enluZXNzID09PSAndW5kZWZpbmVkJyA/IHVzZUFjdHVhbCA/IDAgOiB0aGlzLmRyYXdQYXJhbXMuY2VudGVyRnV6enluZXNzIDogcGFyYW1zLmNlbnRlckZ1enp5bmVzcyksXG4gICAgICAgICAgICByb3RhdGlvbjogKHR5cGVvZiBwYXJhbXMucm90YXRpb24gPT09ICd1bmRlZmluZWQnID8gdXNlQWN0dWFsID8gdGhpcy5kcmF3UGFyYW1zLmFjdHVhbC5yb3RhdGlvbiA6IHRoaXMuZHJhd1BhcmFtcy5yb3RhdGlvbiA6IHBhcmFtcy5yb3RhdGlvbiksXG4gICAgICAgICAgICByb3RhdGlvbkZ1enp5bmVzczogKHR5cGVvZiBwYXJhbXMucm90YXRpb25GdXp6eW5lc3MgPT09ICd1bmRlZmluZWQnID8gdXNlQWN0dWFsID8gMCA6IHRoaXMuZHJhd1BhcmFtcy5yb3RhdGlvbkZ1enp5bmVzcyA6IHBhcmFtcy5yb3RhdGlvbkZ1enp5bmVzcyksXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhY3R1YWxQYXJhbXM7XG4gICAgfVxufVxuIl19;