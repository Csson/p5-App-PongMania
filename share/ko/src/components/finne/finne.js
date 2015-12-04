import ko from 'knockout';
import templateMarkup from 'text!./finne.html';
import { Communicator } from './communicator';
import { Chat } from '../chat/chat';

ko.bindingHandlers.modalVisible = {
    init: function (element) {
        $(element).modal({
            backdrop: 'static',
        });
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if(value()) {
            $(element).modal('show');
        }
        else {
            $(element).modal('hide');
        }
    }
}

class Finne {
    constructor(params) {
        this.message = ko.observable('Hello from the finne component!');
        this.chat = new Chat({ scrollFollow: '#chat-log' });
        this.chatMessage = ko.observable();
        this.gameCode = ko.observable();
        this.gameIsInProgress = ko.observable(false);
        this.server = new Communicator({
            chat: this.chat,
            handleIncoming: (message) => this.incoming(message),
        });

        this.run();
    }

    run() {
        var self = this;
        setTimeout(function() { self.run() }, 500);
    }
    // TODO: Remove this in production...
    clearAllGames() {
        this.server.sendCommand('reset_games');
    }

    incoming(message) {
        if(message.command === 'init_game') {
            this.gameIsInProgress(true);
        }
        else if(message.command === 'chat') {
            this.chat.put({ from: message.from || 'other', text: message.message, status: message.status });
        }
    }

    newGame(form) {
        var playerName = $('#name').val();
        this.gameCode($('#gamecode').val());

        var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
        if(!success) {
            this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.'});
        }
        else {
            this.chat.put({ from: 'server', text: 'Connected to server' });
        }


    }
    submitChatMessage() {
        if(this.chatMessage().length) {
            var success = this.server.sendCommand('chat', { message: this.chatMessage() });

            if(success) {
                this.chat.put({ from: 'self', text: this.chatMessage() });
                this.chatMessage('');
            }
        }
    }

    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Finne, template: templateMarkup };
